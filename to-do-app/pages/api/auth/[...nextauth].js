// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await dbConnect();
        console.log('Attempting to authorize user:', credentials.email);
      
        const user = await User.findOne({ email: credentials.email }).select('+password');
        if (!user) {
          console.log('No user found with email:', credentials.email);
          throw new Error('No user found with this email');
        }
      
        console.log('User found:', user.email);
      
        const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordMatch) {
          console.log('Password mismatch for user:', user.email);
          throw new Error('Invalid password');
        }
      
        console.log('User authenticated successfully:', user.email);
        return { id: user._id, email: user.email, name: user.name };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
});