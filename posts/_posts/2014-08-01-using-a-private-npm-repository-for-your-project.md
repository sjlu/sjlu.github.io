---
layout: post
title: "Using a private npm repository for your project"
description: "How to use modules without publishing globally"
category: "tech"
tags: []
---

So you have a product and you have npm modules that are private to you but you can't really use a GitHub URL because it cannot be easily deployed. Then you look into a private npm repository like Nodejitsu but you don't know how to retrieve your npm packages from a private source without giving away your npm auth credentials. Luckly there's a way to do this.

### Why a private npm service?

Well, first off. You can host your packages without needing to actually open source them. It's also a proxy and caches repositories as required so in case npm looses a package version that you solely depend on, you still have it.

### Getting your private npm service

You'll need a private npm source, we use [Nodejitsu](https://www.nodejitsu.com/pricing/#npm-main) but you can easily use something like [sinopia](https://www.npmjs.org/package/sinopia) if you like hosting things yourself.

If you use Nodejitsu, you'll need to add in users that will maintain your packages. They must have an [npm](https://npmjs.org) account in order to use the private npm service. After all it is a proxy service.

### Creating your first private npm package

After creating your first package with `package.json` in it, you need to publish it to your private npm service. Add the following lines to that file to have published there.

    "publishConfig":{
      "registry":"https://your-repo.registry.nodejitsu.com"
    },

We also like to prefix our package names to something like `"name":"prefix-"` to clearly differentiate that it is our private repo and does not conflict with the public npm repo.

You can then run `npm publish` like if you were publishing a package and it'll make it available on your private npm.

### Installing that private package

Now the problem here is that if you go onto another computer like your production machines, it won't have access to pull down those packages that you published. So in order to do so, we first need to create an account on npm that'll act as our dummy. Lets name that "npm-dummy".

Then on your private npm repository, give npm-dummy access to pull down your private repos. This is like adding any other user.

Afterwards, we need to generate an auth token to use. To do so, you need to run `npm login` and follow the appropriate instructions. When you're done with that, open up the file `~/.npmrc` and copy the `_auth=` line.

In your private project, we need to create a project level `.npmrc` file. Create it and put the following lines in and pasting in the `_auth=` line that you copied before.

    registry="https://abacus.registry.nodejitsu.com"
    strict-ssl=true
    ca=
    always-auth=true
    _auth=

This will allow you to authenticate with your private registry without actually needing an npm account. This however will not allow you to override packages unless you have the account set as a maintainer of those packages.

After that, just fix your `package.json` file to use the package name you chose and `npm install` should work like you expect it to.