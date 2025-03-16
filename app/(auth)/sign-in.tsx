import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { supabase } from '@/data/supabase';
import { useTheme } from '@/lib/styles/useTheme';
import { authStyles } from '@/lib/styles/auth';

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={[authStyles.container, { paddingTop: insets.top }]}
      contentContainerStyle={authStyles.content}
      showsVerticalScrollIndicator={false}>
      <Animated.View 
        entering={FadeInDown.delay(100).springify()}
        style={authStyles.imageContainer}
      >
        <Image
          source={require('@/assets/images/signin.png')}
          style={authStyles.image}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <Text style={authStyles.title}>Welcome Back 👋</Text>
        <Text style={authStyles.subtitle}>
          Sign in to continue
        </Text>
      </Animated.View>

      <Animated.View
        style={authStyles.form}
        entering={FadeInDown.delay(300).springify()}>
        {error && (
          <View style={authStyles.errorContainer}>
            <Text style={authStyles.errorText}>{error}</Text>
          </View>
        )}

        <View style={authStyles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={colors.icon.secondary} />
          <TextInput
            style={authStyles.input}
            placeholder="Email"
            placeholderTextColor={colors.text.placeholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={authStyles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.icon.secondary} />
          <TextInput
            style={authStyles.input}
            placeholder="Password"
            placeholderTextColor={colors.text.placeholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <Pressable 
          style={[authStyles.button, loading && authStyles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={authStyles.buttonText}>Sign In</Text>
          )}
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(600).springify()}>
        <Text style={authStyles.footer}>
          Don't have an account?{' '}
          <Link href="/sign-up" style={authStyles.footerLink}>
            Sign up
          </Link>
        </Text>
      </Animated.View>
    </ScrollView>
  );
}
