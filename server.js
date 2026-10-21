
import "dotenv/config";
import express from "express";
import { createClient } from "@supabase/supabase-js";
import { body, validationResult } from "express-validator";

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

app.get("/", (req, res) => {
  res.json({ message: "Customer API is running" });
});

app.post(
  "/api/customers",
  [
    body("customer_id").isInt().withMessage("Customer ID must be an integer"),
    body("last_name").trim().notEmpty().withMessage("Last name is required"),
    body("first_name").trim().notEmpty().withMessage("First name is required"),
    body("mobile_no").trim().notEmpty().withMessage("Mobile number is required"),
    body("address").trim().notEmpty().withMessage("Address is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { customer_id, last_name, first_name, mobile_no, address } = req.body;

    const { data, error } = await supabase
      .from("customer")
      .insert({
        customer_id: Number(customer_id),
        last_name,
        first_name,
        mobile_no,
        address,
      })
      .select()
      .single();

    if (error) {
      console.error(error);

      if (error.code === "23505") {
        return res.status(409).json({ message: "Customer ID already exists" });
      }

      return res.status(500).json({ message: "Failed to insert customer" });
    }

    res.status(201).json({
      message: "Customer inserted successfully",
      customer: data,
    });
  }
);

app.listen(process.env.PORT || 3000, () => {
  console.log("Customer API is running");
});
