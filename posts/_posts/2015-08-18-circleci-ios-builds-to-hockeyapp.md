---
layout: post
title: "Automating builds with CircleCI and HockeyApp"
description: "Make a release on every commit"
tags: []
---

Continuous deployment is tricky with iOS. There's already several ways to do it
and plenty of SaaS companies that can do it for you. If you're daring, you can
install your own Jenkins setup or just have [Roboto](http://roboto.build/)
do it for you. But for this post's sake, I'll help you get a running solution
with [CircleCI](https://circleci.com/) making builds that post to
[HockeyApp](http://hockeyapp.net/) for you.

1. I'll assume you already have a HockeyApp account, CircleCI account and a GitHub repository
all setup. If not, you should probably start writing your app before doing this!

2. We need to export both your developer certificate and your distribution certificate along
with their respective private keys. We will be encoding these private keys with a password. You
should end up with 4 files, `dev.cer`, `dev.p12`, `dist.cer`, `dist.p12`. The `.cer` files are
exports of your certificates while the `.p12` files are exports of their respective provate keys.
Make sure you keep the password the same for both private keys.
![pic02](/images/screenshots/02.png)
![pic03](/images/screenshots/03.png)

3. Make sure you create or make a copy of your adhoc `.mobileprovision` file for your app.

3. We will need to make an API key in HockeyApp so we can make uploads. This is *not* your app's
key.
![pic04](/images/screenshots/04.png)

3. You need CircleCI to enable OSX build machines for you. They're pretty friendly, so just
ask them using their Intercom integration or just go [here](https://circleci.com/contact)

4. Assuming that you have CircleCI setup on your GitHub repository, you need to enable
"Build iOS project" in Experiemental Settings for that project.
![pic01](/images/screenshots/01.png)

5. We'll also need to setup two environment variables on CircleCI, they are `HOCKEYAPP_TOKEN` and
`KEY_PASSWORD`, both which you created in steps before.
![pic05](/images/screenshots/05.png)

6. In order for CircleCI builds to work properly, you need to enabled Shared schemas. Do so by
editing the schema and checking "shared" at the bottom of the configuration window.
![pic05](/images/screenshots/06.png)
![pic05](/images/screenshots/07.png)

7. I had to remove my testing phase in my schema because I didn't have an appropriate wildcard
App ID to build `appTests` with. If you want to also test with CircleCI, you'll need to recreate
your certificates with the wildcard. You may also need to remove this from your project also.
![pic05](/images/screenshots/08.png)

8. You need to explicitly set the code signing provisioning profile so that the build doesn't
automatically choose for you.
![pic05](/images/screenshots/09.png)

8. Add the following files to your repository structure. Some of which you've already created,
some that you will create now.
    * [circle.yml](https://gist.github.com/sjlu/c648b762f7b17c9beeb6#file-circle-yml)
    * `scripts/`
        * dev.cert
        * dev.p12
        * dist.cert
        * dist.p12
        * [add-key.sh](https://gist.github.com/sjlu/c648b762f7b17c9beeb6#file-add-key-sh)
        * [build.sh](https://gist.github.com/sjlu/c648b762f7b17c9beeb6#file-build-sh)
        * [deploy.sh](https://gist.github.com/sjlu/c648b762f7b17c9beeb6#file-deploy-sh)
        * [remove-key.sh](https://gist.github.com/sjlu/c648b762f7b17c9beeb6#file-remove-key-sh)
        * `profile/`
          * app.mobileprovision

9. Commit and push to start your first build.

### Notes

* This is an adaptation from [Mazyod](http://mazyod.com/blog/2015/03/26/marry-circleci-to-hockey/)
and [thorikawa](https://github.com/thorikawa/CircleCI-iOS-TestFlight-Sample/tree/master/scripts).
You may be able to find more answers there if you run into any problems.
* If you performed a verbose build, your actual errors may occur beforehand. Check the entire
log to see where it actually errored out.
* I could not get my tests to build correctly as it failed to find an appropriate certificate/key
pair. I assumed it was because `com.stevenlu.superagentTests` certificate or App ID did not exist.
I'm sure this can be fixed by creating a Wildcard App ID and its approrpriate certificates.
* I had to update CocoaPods due to some weird [code signing issue](https://github.com/CocoaPods/CocoaPods/issues/3063) that persisted in the default version that CircleCI had.
* If you want auto incremental build numbers that don't conflict, check out the line that's
is commented out in `build.sh` and replace the `Info.plist` file location appropriately.
* I was told that `remove-key.sh` isn't really necessary anymore as each build is deployed on
a new machine on CircleCI. I'd still keep it there for now as keychain password is simple.
* You may need to bump the Xcode version if your app users a newer version of Swift, etc.
