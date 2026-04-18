import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import Stripe from "stripe";
import { Resend } from "resend";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // --- Integrations Setup ---

  // Stripe
  let stripe: Stripe | null = null;
  const getStripe = () => {
    if (!stripe && process.env.STRIPE_SECRET_KEY) {
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    return stripe;
  };

  // Resend
  let resend: Resend | null = null;
  const getResend = () => {
    if (!resend && process.env.RESEND_API_KEY) {
      resend = new Resend(process.env.RESEND_API_KEY);
    }
    return resend;
  };

  // --- API Routes ---

  // Stripe Payment Intent
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const client = getStripe();
      if (!client) throw new Error("Stripe is not configured");

      const { amount } = req.body;
      const paymentIntent = await client.paymentIntents.create({
        amount: Math.round(amount * 100), // convert to cents
        currency: "kes",
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // M-Pesa STK Push (Daraja API Structure)
  app.post("/api/mpesa/stkpush", async (req, res) => {
    try {
      const { phone, amount, orderId } = req.body;
      
      // Note: This is a structural implementation. 
      // In production, you'd first fetch an OAuth token from M-Pesa.
      console.log(`[M-PESA] Initiating STK Push for ${phone} - Amount: ${amount}`);
      
      // Simulate success for demo purposes if keys aren't set
      if (!process.env.MPESA_CONSUMER_KEY) {
        return res.json({ 
          status: "success", 
          message: "Simulation: STK Push sent successfully to " + phone 
        });
      }

      // Actual Daraja logic would go here (fetch token -> post to stkpush uri)
      res.json({ status: "success", message: "STK Push initiated" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Send Order Email (Resend)
  app.post("/api/send-order-email", async (req, res) => {
    try {
      const client = getResend();
      const { email, orderDetails } = req.body;

      if (!client) {
        console.warn(`[RESEND] API Key missing. Simulating email to ${email} for Order #${orderDetails.id}`);
        return res.json({ 
          status: "simulated", 
          message: "Email sending simulated because RESEND_API_KEY is missing." 
        });
      }

      const { data, error } = await client.emails.send({
        from: "ZiwaOmena <orders@ziwaomena.com>",
        to: [email],
        subject: `Order Confirmed - #${orderDetails.id}`,
        html: `
          <div style="font-family: serif; color: #061e11; padding: 20px;">
            <h1 style="color: #2d5a27;">ZiwaOmena Order Confirmation</h1>
            <p>Habari! Your order <strong>#${orderDetails.id}</strong> has been received and is being prepared.</p>
            <p><strong>Total:</strong> Ksh ${orderDetails.total}</p>
            <p><strong>Delivery Address:</strong> ${orderDetails.address}</p>
            <hr />
            <p>Our lakeside chefs are working on your Omena right now!</p>
          </div>
        `,
      });

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FULLSTACK] Server running on http://localhost:${PORT}`);
    console.log(`[INTEGRATIONS] Stripe: ${process.env.STRIPE_SECRET_KEY ? 'Active' : 'Missing KES Key'}`);
    console.log(`[INTEGRATIONS] Resend: ${process.env.RESEND_API_KEY ? 'Active' : 'Missing Key'}`);
  });
}

startServer();
