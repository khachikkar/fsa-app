import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Typography, Upload, Button, Image, message, Spin } from "antd";
import { UploadOutlined, SwapOutlined } from "@ant-design/icons";
import { Client } from "@gradio/client";
import { supabase } from "../../supabaseClient";

import { useDispatch } from "react-redux";
import { addResult } from "../../results/resultsSlice";


const { Title } = Typography;

const templates = [
    {
        id: "1",
        title: "Փարիզյան զգեստով աղջիկ",
        url: "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: "2",
        title: "Տղա փողոցում գիշերով",
        url: "https://images.unsplash.com/photo-1532074205216-d0e1f4b87368?auto=format&fit=crop&w=800&q=80",
    },
    {
        id: "3",
        title: "Էսթետիկ տեսարան անապատում",
        url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    },
];

export default function Swap() {

    const dispatch = useDispatch();

    const [searchParams] = useSearchParams();
    const templateId = searchParams.get("template");

    const selectedTemplate = templates.find((tpl) => tpl.id === templateId);
    const [userImage, setUserImage] = useState(null);
    const [resultUrl, setResultUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    const beforeUpload = (file) => {
        setUserImage(file);
        return false;
    };

    const handleSwap = async () => {
        if (!userImage || !selectedTemplate) {
            message.warning("Վերբեռնի՛ր դեմքի նկար և ընտրիր template");
            return;
        }

        setLoading(true);
        message.loading("Մշակում ենք...");

        try {
            const client = await Client.connect("andyaii/face-swap-new", {
                hf_token: "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"
            });

            const templateBlob = await fetch(selectedTemplate.url).then((res) => res.blob());

            const result = await client.predict("/predict", {
                source_file: userImage,
                target_file: templateBlob,
                doFaceEnhancer: true,
            });

            if (result?.data?.[0]?.url) {
                const apiImageUrl = result.data[0].url;
                // ⬇️ 1․ Get current user
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    message.error("Մուտք գործիր՝ արդյունքը պահպանելու համար");
                    return;
                }

                // ⬇️ 2․ Download image blob
                const imgResponse = await fetch(apiImageUrl);
                const imageBlob = await imgResponse.blob();

                // ⬇️ 3․ Upload to Supabase Storage
                const filename = `${user.id}_${Date.now()}.jpg`;
                const { data: storageData, error: uploadError } = await supabase.storage
                    .from("results")
                    .upload(filename, imageBlob, {
                        contentType: "image/jpeg",
                        upsert: false,
                    });

                if (uploadError) {
                    console.error("Storage upload error:", uploadError);
                    message.error("Չհաջողվեց պատկերը վերբեռնել։");
                    return;
                }

                // ⬇️ 4․ Get public URL & insert into DB
                const { data: { publicUrl } } = supabase.storage
                    .from("results")
                    .getPublicUrl(filename);

                const { error: dbError } = await supabase
                    .from("results")
                    .insert([
                        {
                            user_id: user.id,
                            image_url: publicUrl,
                        },
                    ]);

                if (dbError) {
                    console.error("DB insert error:", dbError);
                    message.error("Չհաջողվեց արդյունքը պահպանել բազայում։");
                    return;
                }

                // ✅ 5․ Պահպանված image preview
                setResultUrl(publicUrl);
                dispatch(
                    addResult({
                        image_url: publicUrl,
                        created_at: new Date().toISOString(),
                    })
                );
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

    return (
        <div style={{ padding: "40px" }}>
            <Title level={2}>🤖 FaceSwap</Title>

            {selectedTemplate ? (
                <>
                    <Image
                        src={selectedTemplate.url}
                        alt="Template"
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
                        </div>
                    )}
                </>
            ) : (
                <p>🙃 Template ընտրված չէ։ Վերադարձիր Home էջ։</p>
            )}
        </div>
    );
}
