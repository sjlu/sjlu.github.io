---
layout: post
title: "Wrapping Kue wth Promises and Domains"
description: "Making your worker functions process with stability"
category:
tags: []
---

If you've ever used [kue](https://github.com/Automattic/kue) before, you'll
notice its callback based. What happens if you loose that callback? Well,
that job will stall your worker and remain "active" until the next time
you restart your worker.

Have you also noticed that failed and completed jobs take up redis'
memory space? That's not good either especially if you have a small
Redis memory instance. You also want Redis to be the least CPU intensive
part of your application too.

Why do we need the other queue states too? I find those completely
redundant to have. The only ones I care about is how many jobs are
waiting to be executed and which ones are being executed. Everything
else can be stored in my text logs for me to take a look at later.

Here's a little snippet of how I've been able to resolve these problems.
I do assume that you have some sort of external logging service such
as [Papertrail](http://papertrail.com) and that you do not really care
about the output of the job that you are running.

If you've also noticed, async errors are not caught well within
promises and will cause Kue or your worker to crash. When that happens
any other job that is processing with it now goes into limbo or
an inactive state. Kue finally [documented](https://github.com/Automattic/kue#error-handling)
several ways on how to keep this from happening. In my method, I do a hybrid
of both and wrap it with a Promise and a domain.

{% highlight javascript %}
var kue = require('kue');
var jobs = kue;
var Promise = require('bluebird');
var winston = require('winston');
var domains = require('domains');

// cleanup every job that has completed
// since we don't really care about the data
jobs.on('job complete', function(id) {
  kue.Job.get(id, function(err, job) {
    if (job) {
      job.remove();
    }
  });
});

// Every job that you register is wrapped
// with this function and executed by a
// promise wrapper instead.
function registerJob(processName, processFn){
  // "4" is the concurrency, or how many of this job
  // can run at a time.
  jobs.process(processName, 4, function(job, done) {
    Promise
      .resolve()
      // gives you the ability to do "this" calls
      .bind({})
      .then(function() {
        winston.info('[worker] job started', {
          type: job.type,
          // the time it took for your job to actually
          // get executed
          ttl: Date.now() - job.created_at + 'ms'
        })
      })
      .then(function() {
        this.start = Date.now();
        // Promise vs. non-promise
        if (processFn.length !== 1) {
          // we wanna wrap non-promise async calls
          // with domains cause if it throws an
          // error that'll cause the thread to crash
          // we want to make sure that does not happen
          // and that we continue processing
          return new Promise(function(resolve, reject) {
            var d = domain.create();
            d.on('error', function(err) {
              return reject(err);
            });
            d.run(function() {
              processFn(job, function(err) {
                if (err) return reject(err);
                return resolve();
              })
            })
          });
        } else {
          // note that we don't need domains here
          // cause I hope you're using promises
          // the right way
          return processFn(job);
        }
      })
      .timeout(90000)
      .then(function() {
        winston.info('[worker] job finished', {
          type: job.type,
          // this tells us how long it took
          // to run the job.
          duration: Date.now() - this.start + 'ms'
          // data: job.data
        })
      })
      // catch all the errors that have been
      // produced by our job or the overlying
      // promise
      .catch(function(err) {
        winston.error('[worker] job failed', {
          type: job.type,
          data: job.data
        })
        console.trace(err);
        return;
      })
      // even if we fail, done is called EVERY time
      .finally(function() {
        done();
      })
  })
}
{% endhighlight %}