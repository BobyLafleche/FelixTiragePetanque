import { NativeScriptConfig } from '@nativescript/core';

export default {
  id: 'com.tirageequipes.app',
  appPath: 'app',
  appResourcesPath: 'App_Resources',
  android: {
    v8Flags: '--expose_gc',
    markingMode: 'none',
    maxLogcatObjectSize: 2048,
    discardUncaughtJsExceptions: true,
    packageName: 'com.tirageequipes.app',
    minSdkVersion: 23,
    targetSdkVersion: 33
  }
} as NativeScriptConfig;