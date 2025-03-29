import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const url = isLogin
                ? "http://localhost:5000/api/auth/login"
                : "http://localhost:5000/api/auth/signup";

            const payload = isLogin ? { email, password } : { name: name.trim(), email: email.trim(), password };

            console.log("Sending Request:", JSON.stringify(payload)); // 🔍 Debug Log

            const response = await axios.post(url, payload, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true, // If using cookies for auth
            });

            console.log("Success:", response.data);

            localStorage.setItem("token", response.data.token); // Store token

            navigate("/dashboard");
        } catch (error) {
            console.error("Auth Error:", error.response?.data || error.message);
        }
    };



    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h2 className="text-3xl font-bold mb-4">{isLogin ? "Login" : "Sign Up"}</h2>
            <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded-lg w-96">
                {!isLogin && (
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 border rounded mb-4"
                        required
                    />
                )}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded mb-4"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border rounded mb-4"
                    required
                />
                <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded mt-2">
                    {isLogin ? "Login" : "Sign Up"}
                </button>
            </form>
            <p className="mt-4">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button onClick={() => setIsLogin(!isLogin)} className="text-blue-500 ml-2">
                    {isLogin ? "Sign Up" : "Login"}
                </button>
            </p>
        </div>
    );
};

export default AuthPage;
