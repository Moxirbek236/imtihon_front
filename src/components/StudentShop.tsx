"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Grid,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from "@mui/material";
import { MonetizationOn, ShoppingBag } from "@mui/icons-material";
import { toast } from "sonner";
import axiosClient from "../api/axios";

export default function StudentShop() {
  const [tab, setTab] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
  const [myPurchases, setMyPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [myCoins, setMyCoins] = useState(0);

  useEffect(() => {
    fetchData();
  }, [tab]);

  async function fetchData() {
    setLoading(true);
    try {
      const [productsRes, purchasesRes, profileRes] = await Promise.all([
        axiosClient.get("/products"),
        axiosClient.get("/products/my-purchases"),
        axiosClient.get("/students/my/dashboard")
      ]);

      if (productsRes.data?.success) setProducts(productsRes.data.data);
      if (purchasesRes.data?.success) setMyPurchases(purchasesRes.data.data);
      if (profileRes.data?.success) setMyCoins(profileRes.data.data.coins);
    } catch (error) {
      console.error("Shop ma'lumotlari yuklanmadi", error);
    } finally {
      setLoading(false);
    }
  }

  const handleBuyProduct = async () => {
    if (!selectedProduct) return;

    if (myCoins < selectedProduct.price) {
      toast.error("Hisobingizda yetarli kumush yo'q!");
      setSelectedProduct(null);
      return;
    }

    try {
      const res = await axiosClient.post(`/products/${selectedProduct.id}/buy`);
      if (res.data?.success) {
        toast.success("Sovg'a muvaffaqiyatli xarid qilindi!");
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xaridni amalga oshirishda xatolik yuz berdi");
    } finally {
      setSelectedProduct(null);
    }
  };

  return (
    <Box sx={{ p: 3.5, width: "100%", boxSizing: "border-box" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: 26, fontWeight: 700, mb: 0.5 }}>Do'kon</Typography>
          <Typography sx={{ color: "#6b7280", fontSize: 14 }}>
            Yig'ilgan kumushlarga sovg'alar sotib oling
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "#fffbeb", px: 2, py: 1, borderRadius: 2, border: "1px solid #fde68a" }}>
          <MonetizationOn sx={{ color: "#d97706" }} />
          <Typography sx={{ fontWeight: 700, color: "#92400e" }}>{myCoins} Kumush</Typography>
        </Box>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Barcha Sovg'alar" />
        <Tab label="Mening xaridlarim" />
      </Tabs>

      {loading ? (
        <LinearProgress />
      ) : tab === 0 ? (
        <Grid container spacing={3}>
          {products.map((p) => (
            <Grid item xs={12} sm={6} md={4} key={p.id}>
              <Card sx={{ borderRadius: 3, border: "1px solid #e5e7eb", elevation: 0 }}>
                {p.image ? (
                  <CardMedia component="img" height="180" image={`http://localhost:3000/uploads/${p.image}`} alt={p.name} sx={{ objectFit: "cover" }} />
                ) : (
                  <Box sx={{ height: 180, bgcolor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ShoppingBag sx={{ fontSize: 60, color: "#9ca3af" }} />
                  </Box>
                )}
                <CardContent>
                  <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 0.5 }}>{p.name}</Typography>
                  <Typography sx={{ color: "#6b7280", fontSize: 14, mb: 2, minHeight: 40 }}>{p.description}</Typography>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <MonetizationOn sx={{ color: "#d97706", fontSize: 18 }} />
                      <Typography sx={{ fontWeight: 700, color: "#92400e" }}>{p.price}</Typography>
                    </Box>
                    <Button
                      variant="contained"
                      size="small"
                      disabled={p.stock <= 0 || myCoins < p.price}
                      onClick={() => setSelectedProduct(p)}
                      sx={{ bgcolor: "#7c3aed", borderRadius: 2, "&:hover": { bgcolor: "#6d28d9" } }}
                    >
                      {p.stock > 0 ? "Sotib olish" : "Tugagan"}
                    </Button>
                  </Box>
                  <Typography sx={{ fontSize: 12, color: "#9ca3af", mt: 1 }}>Qoldiq: {p.stock} ta</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {products.length === 0 && (
            <Typography sx={{ color: "#6b7280", width: "100%", textAlign: "center", mt: 4 }}>
              Hozircha do'konda sovg'alar yo'q.
            </Typography>
          )}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {myPurchases.map((p) => (
            <Grid item xs={12} sm={6} md={4} key={p.id}>
              <Card sx={{ borderRadius: 3, border: "1px solid #e5e7eb", elevation: 0 }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 0.5 }}>{p.product?.name}</Typography>
                  <Typography sx={{ color: "#6b7280", fontSize: 12, mb: 2 }}>
                    Xarid qilingan sana: {new Date(p.created_at).toLocaleString("ru-RU")}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <MonetizationOn sx={{ color: "#d97706", fontSize: 16 }} />
                    <Typography sx={{ fontWeight: 700, color: "#92400e" }}>{p.price}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {myPurchases.length === 0 && (
            <Typography sx={{ color: "#6b7280", width: "100%", textAlign: "center", mt: 4 }}>
              Siz hali hech narsa xarid qilmadingiz.
            </Typography>
          )}
        </Grid>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={!!selectedProduct} onClose={() => setSelectedProduct(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Xaridni tasdiqlang</DialogTitle>
        <DialogContent>
          <Typography>
            Siz haqiqatan ham <b>{selectedProduct?.name}</b> sovg'asini <b>{selectedProduct?.price}</b> kumushga sotib olmoqchimisiz?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setSelectedProduct(null)} color="inherit">Bekor qilish</Button>
          <Button onClick={handleBuyProduct} variant="contained" sx={{ bgcolor: "#7c3aed", "&:hover": { bgcolor: "#6d28d9" } }}>
            Tasdiqlash
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
