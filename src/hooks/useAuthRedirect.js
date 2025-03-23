import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export const useRedirectIfLoggedIn = () => {
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const { data } = await supabase.auth.getUser();

            if (data?.user) {
                navigate("/profile");
            } else {
                setIsChecking(false); // ցուցադրել login/signup էջ
            }
        };

        checkUser();
    }, []);

    return isChecking;
};
