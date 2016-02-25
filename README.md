SS4U-WPApp
==========

Ionic app for wordpress blog

How to use this app
-------------------

This app does not work on its own. It is missing the Ionic library, and cordova plugins.

To use this, either create a new ionic project using the ionic node.js utility, or copy and paste this into an existing Cordova project and download a release of Ionic separately.

Installation
-----------

```
$ sudo npm install -g ionic cordova
$ sudo ionic start myApp balnk
```
For social sharing include cordova plugin [Social Sharing plugin](https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin)

```
$ ionic plugin add https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin.git
```
or
```
$ cordova plugin add nl.x-services.plugins.socialsharing
```

For open the link in external browser include

```
cordova plugin add https://git-wip-us.apache.org/repos/asf/cordova-plugin-inappbrowser.git
```

For splash screen include cordova plugin

```
cordova plugin add org.apache.cordova.splashscreen
```

For checking network activity include [$cordovaNetwork](http://ngcordova.com/docs/plugins/network/)
```
cordova plugin add org.apache.cordova.network-information
```

For push notification add plugin [$cordovaPush](http://ngcordova.com/docs/plugins/pushNotifications/)
```
cordova plugin add https://github.com/phonegap-build/PushPlugin.git
```

Replace the _www_ folder with the current branch files.

Wordpress setup
---------------

Install latest wordpress in your server and install the following plugins,
* [JSON API](https://wordpress.org/plugins/json-api/)
* [JSON API User](https://wordpress.org/plugins/json-api-user/)
* [Buddypress](https://wordpress.org/plugins/buddypress/). After installing it should enabled in wordpress settings.
* Wordpress GCM Push. Contact our the administrator to get plugin files.

