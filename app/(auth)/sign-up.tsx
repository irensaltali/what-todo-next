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
import { StatusBar } from '@/components/StatusBar';
import { authStyles } from '@/lib/styles/auth';
import { useTheme } from '@/lib/styles/useTheme';

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePassword = (pass: string) => {
    if (pass.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  };

  const handleSignUp = async () => {
    if (!agreed) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        // Create a profile for the user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              name,
            },
          ]);

        if (profileError) throw profileError;

        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[authStyles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background.primary }]}
      contentContainerStyle={authStyles.content}
      showsVerticalScrollIndicator={false}>
      <Animated.View 
        entering={FadeInDown.delay(100).springify()}
        style={authStyles.imageContainer}
      >
        <Image
          source={require('@/assets/images/signup.png')}
          style={authStyles.image}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <Text style={[authStyles.title, { color: theme.colors.text.primary }]}>Create Account 👋</Text>
        <Text style={[authStyles.subtitle, { color: theme.colors.text.secondary }]}>
          Please fill in the form to continue
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

        <View style={[authStyles.inputContainer, { backgroundColor: theme.colors.background.tertiary }]}>
          <Ionicons name="person-outline" size={20} color={theme.colors.text.placeholder} />
          <TextInput
            style={[authStyles.input, { color: theme.colors.text.primary }]}
            placeholder="Name"
            placeholderTextColor={theme.colors.text.placeholder}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={[authStyles.inputContainer, { backgroundColor: theme.colors.background.tertiary }]}>
          <Ionicons name="mail-outline" size={20} color={theme.colors.text.placeholder} />
          <TextInput
            style={[authStyles.input, { color: theme.colors.text.primary }]}
            placeholder="Email"
            placeholderTextColor={theme.colors.text.placeholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={[authStyles.inputContainer, { backgroundColor: theme.colors.background.tertiary }]}>
          <Ionicons name="lock-closed-outline" size={20} color={theme.colors.text.placeholder} />
          <TextInput
            style={[authStyles.input, { color: theme.colors.text.primary }]}
            placeholder="Password"
            placeholderTextColor={theme.colors.text.placeholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <Pressable
          style={authStyles.checkboxContainer}
          onPress={() => setAgreed(!agreed)}>
          <View style={[authStyles.checkbox, agreed && authStyles.checkboxChecked]}>
            {agreed && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={[authStyles.checkboxLabel, { color: theme.colors.text.secondary }]}>
            I agree to the{' '}
            <Text style={authStyles.link}>Terms of Service</Text> and{' '}
            <Text style={authStyles.link}>Privacy Policy</Text>
          </Text>
        </Pressable>

        <Pressable 
          style={[authStyles.button, loading && authStyles.buttonDisabled, { backgroundColor: theme.colors.primary }]}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={authStyles.buttonText}>Continue</Text>
          )}
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(600).springify()}>
        <Text style={[authStyles.footer, { color: theme.colors.text.secondary }]}>
          Already have an account?{' '}
          <Link href="/sign-in" style={[authStyles.footerLink, { color: theme.colors.primary }]}>
            Sign in
          </Link>
        </Text>
      </Animated.View>
    </ScrollView>
  );
}
