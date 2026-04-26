require('dotenv').config();
const { Telegraf } = require('telegraf');
const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");
const axios = require('axios');
const express = require('express');
const { Pool } = require('pg');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const aiClient = new OpenAIClient(process.env.AZURE_ENDPOINT, new AzureKeyCredential(process.env.AZURE_KEY));
const app = express();
app.use(express.json());

// Koneksi ke PostgreSQL
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const validateBudget = (budget) => {
    const minBudget = 15000; 
    const maxBudget = 5000000; 
    const num = Number(budget);
    return !isNaN(num) && num >= minBudget && num <= maxBudget;
};

bot.on('text', async (ctx) => {
    const userMessage = ctx.message.text;
    const chatId = ctx.chat.id;

    // Daftarkan user ke DB jika belum ada
    await pool.query('INSERT INTO users (telegram_chat_id) VALUES ($1) ON CONFLICT DO NOTHING', [chatId]);

    await ctx.reply("🔄 Menyusun strategi dan materi iklan Anda...");

    try {
        const systemPrompt = `
        Anda adalah Adsistent AI, asisten spesialis pembuat iklan Facebook untuk toko ritel/grosir.
        Ekstrak permintaan pengguna ke dalam JSON murni.
        Format Wajib:
        {
          "intent": "CREATE_AD" | "OTHER",
          "product_name": "nama produk",
          "budget_idr": "angka bulat (tanpa titik/koma)",
          "copywriting": "Buatkan teks iklan yang persuasif, singkat, dan menggunakan bahasa Indonesia yang ramah."
        }
        Pesan Pengguna: "${userMessage}"
        Keluarkan HANYA JSON.`;

        const response = await aiClient.getChatCompletions(process.env.AZURE_DEPLOYMENT_NAME, [
            { role: "system", content: "Keluarkan murni JSON tanpa format markdown." },
            { role: "user", content: systemPrompt }
        ]);

        let rawJson = response.choices[0].message.content.replace(/```json/gi, '').replace(/```/gi, '').trim();
        const aiData = JSON.parse(rawJson);

        if (aiData.intent === "CREATE_AD") {
            if (!validateBudget(aiData.budget_idr)) {
                return ctx.reply("⚠️ Anggaran tidak valid. Pastikan minimal Rp15.000.");
            }

            const campaignName = `Adsistent - ${aiData.product_name} - ${Date.now()}`;
            await ctx.reply(`🚀 Menyiapkan kampanye di Meta: ${campaignName}...`);

            // MENGIRIM DATA ASLI KE META GRAPH API
            const metaApiUrl = `https://graph.facebook.com/v19.0/${process.env.META_AD_ACCOUNT_ID}/campaigns`;
            
            try {
                const metaResponse = await axios.post(metaApiUrl, {
                    name: campaignName,
                    objective: 'OUTCOME_LEADS', // Objektif pencarian prospek
                    status: 'ACTIVE',
                    special_ad_categories: ['NONE'],
                    access_token: process.env.META_ACCESS_TOKEN
                });

                const campaignId = metaResponse.data.id;

                // Simpan ke Database untuk dievaluasi oleh n8n nanti
                await pool.query(
                    'INSERT INTO campaigns (campaign_id, telegram_chat_id, campaign_name, daily_budget_idr) VALUES ($1, $2, $3, $4)',
                    [campaignId, chatId, campaignName, aiData.budget_idr]
                );

                /* CATATAN ARSITEKTUR:
                 * Di eksekusi produksi nyata, Meta mewajibkan Anda membuat Ad Set dan Ad 
                 * setelah Campaign terbentuk. Anda perlu melakukan 2 HTTP POST request tambahan
                 * ke endpoint /adsets dan /ads menggunakan campaignId ini.
                 */

                await ctx.reply(`✅ Kampanye berhasil tayang di Meta!\n\nID Kampanye: ${campaignId}\nAI akan mengawasi metriknya setiap jam.`);

            } catch (metaError) {
                console.error("Meta API Failed:", metaError.response?.data || metaError.message);
                ctx.reply(`❌ Gagal menayangkan iklan ke Meta API. Pesan Error: ${metaError.response?.data?.error?.message || 'Unknown'}`);
            }

        } else {
            ctx.reply("Sebutkan barang yang ingin diiklankan dan anggarannya. Saya akan urus sisanya.");
        }
    } catch (error) {
        console.error("System Error:", error);
        ctx.reply("⚠️ Maaf, AI gagal memproses permintaan Anda.");
    }
});

const PORT = process.env.PORT || 3000;
// Gunakan Webhook sungguhan
app.use(bot.webhookCallback('/secret-telegram-webhook'));

app.listen(PORT, async () => {
    console.log(`🚀 Adsistent Backend berjalan di port ${PORT}`);
    try {
        await bot.telegram.setWebhook(`${process.env.WEBHOOK_DOMAIN}/secret-telegram-webhook`);
        console.log(`✅ Webhook Telegram berhasil diset ke ${process.env.WEBHOOK_DOMAIN}`);
    } catch (e) {
        console.error("Gagal set webhook:", e.message);
    }
});
