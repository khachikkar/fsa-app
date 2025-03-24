// 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
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Typography, Upload, Button, Image, message, Spin } from "antd";
import { UploadOutlined, SwapOutlined, DownloadOutlined } from "@ant-design/icons";
import { Client } from "@gradio/client";
import { supabase } from "../../supabaseClient";
import { useDispatch } from "react-redux";
import { addResult } from "../../results/resultsSlice";
import {useNavigate} from "react-router-dom";


const { Title } = Typography;

export default function Swap() {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const templateId = searchParams.get("template");

    const [template, setTemplate] = useState(null);
    const [userImage, setUserImage] = useState(null);
    const [resultUrl, setResultUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate()

    // 🔄 Fetch selected template from Supabase
    useEffect(() => {
        const fetchTemplate = async () => {
            const { data, error } = await supabase
                .from("templates")
                .select("*")
                .eq("id", templateId)
                .single();

            if (error || !data) {
                message.error("Template չգտնվեց։");
            } else {
                setTemplate(data);
            }
        };

        if (templateId) fetchTemplate();
    }, [templateId]);

    const beforeUpload = (file) => {
        setUserImage(file);
        return false;
    };

    const handleSwap = async () => {
        if (!userImage || !template) {
            message.warning("Վերբեռնի՛ր դեմքի նկար և ընտրիր template");
            return;
        }

        setLoading(true);
        message.loading("Մշակում ենք...");

        try {
            const client = await Client.connect("andyaii/face-swap-new", {
                hf_token: "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",
            });

            const templateBlob = await fetch(template.url).then((res) => res.blob());

            const result = await client.predict("/predict", {
                source_file: userImage,
                target_file: templateBlob,
                doFaceEnhancer: true,
            });

            if (result?.data?.[0]?.url) {
                const apiImageUrl = result.data[0].url;
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const imgResponse = await fetch(apiImageUrl);
                const imageBlob = await imgResponse.blob();
                const filename = `${user.id}_${Date.now()}.jpg`;

                const { error: uploadError } = await supabase.storage
                    .from("results")
                    .upload(filename, imageBlob, {
                        contentType: "image/jpeg",
                        upsert: false,
                    });

                if (uploadError) {
                    message.error("Չհաջողվեց վերբեռնել արդյունքը։");
                    return;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from("results")
                    .getPublicUrl(filename);

                await supabase.from("results").insert([
                    { user_id: user.id, image_url: publicUrl },
                ]);

                dispatch(
                    addResult({
                        image_url: publicUrl,
                        created_at: new Date().toISOString(),
                    })
                );

                setResultUrl(publicUrl);
                message.success("✅ Արդյունքը պահպանվել է քո պրոֆիլում։");
            } else {
                message.error("❌ FaceSwap չհաջողվեց։");
            }
        } catch (err) {
            console.error("FaceSwap error:", err);
            message.error("❌ Սերվերի կամ API-ի սխալ");
        }

        setLoading(false);
    };

    if (!template) {
        return (
            <div style={{ padding: 40 }}>
                <Title level={3}>🙃 Template ընտրված չէ կամ գոյություն չունի։</Title>
            </div>
        );
    }

    return (
        <div style={{ padding: 40 }}>
            <Title level={2}>🤖 FaceSwap</Title>
            <Button type="primary" onClick={()=>navigate("/profile")} >Տեսնել իմ Պրոֆիլը</Button>
            <Image
                src={template.url}
                alt={template.title}
                width={300}
                style={{ borderRadius: 10, marginBottom: 20 }}
            />

            <Upload beforeUpload={beforeUpload} showUploadList={false} accept="image/*">
                <Button icon={<UploadOutlined />}>Վերբեռնել դեմքի նկար</Button>
            </Upload>

            {userImage && (
                <div style={{ marginTop: 20 }}>
                    <Image
                        src={URL.createObjectURL(userImage)}
                        alt="User"
                        width={200}
                        style={{ borderRadius: 10 }}
                    />
                </div>
            )}

            <Button
                type="primary"
                icon={<SwapOutlined />}
                onClick={handleSwap}
                style={{ marginTop: 20 }}
                loading={loading}
            >
                Փոխել դեմքը
            </Button>

            {resultUrl && (
                <div style={{ marginTop: 30 }}>
                    <Title level={4}>Արդյունք</Title>
                    <Image src={resultUrl} alt="Result" width={300} />
                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        style={{ marginTop: 10 }}
                        onClick={async () => {
                            const response = await fetch(resultUrl);
                            const blob = await response.blob();
                            const blobUrl = URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = blobUrl;
                            link.download = "faceswap_result.jpg";
                            link.click();
                            URL.revokeObjectURL(blobUrl);
                        }}
                        block
                    >
                        Ներբեռնել
                    </Button>
                </div>
            )}
        </div>
    );
}
