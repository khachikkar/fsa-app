import { useState } from "react";
import { supabase } from "../../supabaseClient";
import {useRedirectIfLoggedIn} from "../hooks/useAuthRedirect.js";


export default function Signup() {

    const isChecking = useRedirectIfLoggedIn();

    if (isChecking) {
        return <p className="text-center mt-10">🔄 Ստուգում ենք մուտքը...</p>;
    }

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSignup = async () => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setMessage(error.message);
        } else {
            setMessage("✅ Գրանցումը հաջողվեց, ստուգիր քո email-ը։");
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-4">🆕 Գրանցում</h1>
            <input
                type="email"
                placeholder="Email"
                className="border p-2 mb-2 w-full"
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                className="border p-2 mb-2 w-full"
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleSignup} className="bg-blue-600 text-white px-4 py-2">
                Գրանցվել
            </button>
            {message && <p className="mt-4 text-sm">{message}</p>}
        </div>
    );
}
