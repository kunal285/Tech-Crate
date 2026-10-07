# Optimization & Code Shrinking Settings for App Size Reduction
-optimizationpasses 5
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-dontpreverify

# Remove verbose log statements in production release builds
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
    public static *** w(...);
}

# Keep essential React Native & Hermes classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-dontwarn com.facebook.react.**
-dontwarn com.facebook.hermes.**

# Third-party component keeps
-keep class com.oblador.vectoricons.** { *; }
-keep class com.swmansion.** { *; }
-dontwarn com.swmansion.**
-dontwarn okhttp3.**
-dontwarn okio.**
