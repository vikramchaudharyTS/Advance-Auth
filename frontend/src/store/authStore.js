//@ts-nocheck
import {create} from 'zustand'
import axios from 'axios'


const API_URL = 'http://localhost:3000/api/auth'

axios.defaults.withCredentials = true

export const useAuthStore = create((set)=>({

    user:null,
    isAuthenticated: false,
    error: null,
    isLoading: false,
    isCheckingAuth: true,

    signup: async(email, password, name) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/signup`, { email, password, name });
            console.log("Signup response:", response);
            set({ user: response.data.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            console.error("Signup error:", error);
            set({ error: error.response?.data?.message || "Error Signing up", isLoading: false });
            throw error;
        }
    },
    
    login: async(email, password)=>{
        set({isLoading: true, error:null})
        try {
            const response = await axios.post(`${API_URL}/login`, {email, password, name})
            set({user:response.data.user, isAuthenticated: true, isLoading: false, error: null})
        } catch (error) {
            set({error: error.response.data.message || "Error Signing up", isLoading: false})
            throw error
        }
    },

    logout: async()=>{
        set({isLoading: true, error: null})
        try {
            await axios.post(`${API_URL}/logout`)
            set({user:null, isAuthenticated: false, error:null  , isLoading: false})
        } catch (error) {
            set({error:  "Error Logging you out", isLoading: false})
            throw error
        }
    },

    verifyEmail: async (code)=>{
        set({isLoading: true, error:null})
        try {
            const response = await axios.post(`${API_URL}/verify-email`, {code})
            set({user:response.data.user, isAuthenticated: true, isLoading: false})
            return response.data
        } catch (error) {
            set({error: error.response.data.message || "Verifying emial error", isLoading: false})
            throw error
        }
    },

    checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/check-auth`);
            set({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false,
                isCheckingAuth: false, 
            });
        } catch (error) {
            set({
                error: null,
                isCheckingAuth: false, 
                isAuthenticated: false,
            });
        }
    },
    forgotPassword: async (email) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/forgot-password`, { email });
			set({ message: response.data.message, isLoading: false });
		} catch (error) {
			set({
				isLoading: false,
				error: error.response.data.message || "Error sending reset password email",
			});
			throw error;
		}
	},
	resetPassword: async (token, password, confirmPassword) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/reset-password/${token}`, {
                newPassword: password,
                confirmNewPassword: confirmPassword
            });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error.response.data.message || "Error resetting password",
            });
            throw error;
        }
    }
    
    
    
}))