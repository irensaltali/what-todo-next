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

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
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
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <Animated.View 
        entering={FadeInDown.delay(100).springify()}
        style={styles.imageContainer}
      >
        <Image
          source={require('@/assets/images/signup.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).springify()}>
        <Text style={styles.title}>Create Account 👋</Text>
        <Text style={styles.subtitle}>
          Please fill in the form to continue
        </Text>
      </Animated.View>

      <Animated.View
        style={styles.form}
        entering={FadeInDown.delay(300).springify()}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#8E8E93" />
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#8E8E93"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#8E8E93" />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#8E8E93"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#8E8E93" />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#8E8E93"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <Pressable
          style={styles.checkboxContainer}
          onPress={() => setAgreed(!agreed)}>
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={styles.checkboxLabel}>
            I agree to the{' '}
            <Text style={styles.link}>Terms of Service</Text> and{' '}
            <Text style={styles.link}>Privacy Policy</Text>
          </Text>
        </Pressable>

        <Pressable 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(600).springify()}>
        <Text style={styles.footer}>
          Already have an account?{' '}
          <Link href="/sign-in" style={styles.footerLink}>
            Sign in
          </Link>
        </Text>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  image: {
    width: '100%',
    height: 200,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#8E8E93',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FF9F1C',
    borderColor: '#FF9F1C',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#8E8E93',
  },
  link: {
    color: '#FF9F1C',
  },
  button: {
    backgroundColor: '#FF9F1C',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  footer: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 32,
  },
  footerLink: {
    color: '#FF9F1C',
    fontWeight: 'bold',
  },
});
