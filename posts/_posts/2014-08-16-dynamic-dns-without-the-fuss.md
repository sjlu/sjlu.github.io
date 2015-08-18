---
layout: post
title: "Dynamic DNS without the fuss"
description: "DynDNS without the monthly email check with CloudFlare"
tags: []
---

I was fed up with the consistant emails that I had to fill in with a reCAPTCHA that was always
extremely difficult to read. So I decided to do something about it.

### What we will be using

If you aren't using [CloudFlare](http://cloudflare.com) for your domains, you should
definitely use it. Their service plus the features they provide as a DNS host is
amazing. And I forgot to mention, it's free.

Even though their dynamic DNS host update is not really widely supported on modems and routers,
you can get this easily running on one of your Linux servers.

I'll be installing this on a Debian Wheezy machine, but can be easily installed anywhere else.

### How to do this

* Before you begin, go obtain your [CloudFlare](http://cloudflare.com) API key and setup an "A" record subdomain.

* First download a copy of [ddclient](http://sourceforge.net/projects/ddclient/)

{% highlight bash %}
wget "http://downloads.sourceforge.net/project/ddclient/ddclient/ddclient-3.8.2/ddclient-3.8.2.tar.bz2?r=http%3A%2F%2Fsourceforge.net%2Fprojects%2Fddclient%2F&ts=1408222484&use_mirror=softlayer-dal" -O ddclient-3.8.2.tar.bz2
{% endhighlight %}

* Extract the file you just downloaded.

{% highlight bash %}
tar -xvf ddclient-3.8.2.tar.bz2
cd ddclient-3.8.2
{% endhighlight %}

* We need to patch the executable with compatability to access the CloudFront API.

{% highlight bash %}
wget https://gist.githubusercontent.com/sjlu/f642da315be9751eee48/raw/cef253bd137a345a09b74d509a1d083dee357b7a/cloudflare-ddclient.patch
patch > cloudflare-ddclient.patch
{% endhighlight %}


* Install like normal onto your system.

{% highlight bash %}
        cp ddclient /usr/sbin/
        mkdir /etc/ddclient
        mkdir /var/cache/ddclient
        cp sample-etc_ddclient.conf /etc/ddclient/ddclient.conf
        cp sample-etc_rc.d_init.d_ddclient.ubuntu /etc/init.d/ddclient
        update-rc.d ddclient defaults
{% endhighlight %}

* Modify the config file with CloudFront info.

{% highlight bash %}
        vim /etc/ddclient/ddclient.conf
{% endhighlight %}

* Put this at the end of the file.

{% highlight bash %}
        use=web, web=checkip.dyndns.com/, web-skip='IP Address'
        ##
        ## Cloudflare
        ##
        protocol=cloudflare,                            \
        server=www.cloudflare.com,                      \
        zone=stevenlu.com,                              \
        login=cloudfront_email_address,                 \
        password=cloudfront_api_key                     \
        subdomain.stevenlu.com
{% endhighlight %}

* Check to see if it runs alright.

{% highlight bash %}
        sudo /etc/init.d/ddclient start
{% endhighlight %}

* Make sure it updated the IP address under the "A" record you created in your CloudFlare account.

### You're finished!

Now whenever your server is up and running, it'll ping CloudFlare with the IP address it
obtained from DynDNS every 5 minutes or so.

