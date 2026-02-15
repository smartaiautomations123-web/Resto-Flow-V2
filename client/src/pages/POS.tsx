import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, Receipt, X } from "lucide-react";

type CartItem = {
  menuItemId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  modifiers: { name: string; price: number }[];
  notes: string;
};

export default function POS() {
  const utils = trpc.useUtils();
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: allMenuItems } = trpc.menu.list.useQuery();
  const { data: tablesList } = trpc.tables.list.useQuery();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<"dine_in" | "takeaway" | "delivery" | "collection">("dine_in");
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [tip, setTip] = useState(0);

  const createOrder = trpc.orders.create.useMutation();
  const addItem = trpc.orders.addItem.useMutation();
  const updateOrder = trpc.orders.update.useMutation();
  const updateTable = trpc.tables.update.useMutation();

  const filteredItems = useMemo(() => {
    if (!allMenuItems) return [];
    return selectedCategory ? allMenuItems.filter(i => i.categoryId === selectedCategory && i.isAvailable) : allMenuItems.filter(i => i.isAvailable);
  }, [allMenuItems, selectedCategory]);

  const subtotal = cart.reduce((s, i) => s + (i.unitPrice + i.modifiers.reduce((m, mod) => m + mod.price, 0)) * i.quantity, 0);
  const tax = subtotal * 0.1;
  const serviceCharge = subtotal * 0.05;
  const total = subtotal + tax + serviceCharge - discount + tip;

  const addToCart = (item: NonNullable<typeof allMenuItems>[0]) => {
    setCart(prev => {
      const existing = prev.find(c => c.menuItemId === item.id && c.modifiers.length === 0);
      if (existing) return prev.map(c => c === existing ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { menuItemId: item.id, name: item.name, quantity: 1, unitPrice: Number(item.price), modifiers: [], notes: "" }];
    });
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], quantity: updated[index].quantity + delta };
      if (updated[index].quantity <= 0) updated.splice(index, 1);
      return updated;
    });
  };

  const handlePayment = async (method: "card" | "cash" | "split") => {
    try {
      const order = await createOrder.mutateAsync({
        type: orderType,
        tableId: selectedTable ? Number(selectedTable) : undefined,
        customerName: customerName || undefined,
      });

      for (const item of cart) {
        const itemTotal = (item.unitPrice + item.modifiers.reduce((m, mod) => m + mod.price, 0)) * item.quantity;
        await addItem.mutateAsync({
          orderId: order.id,
          menuItemId: item.menuItemId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toFixed(2),
          totalPrice: itemTotal.toFixed(2),
          modifiers: item.modifiers.length > 0 ? item.modifiers : undefined,
          notes: item.notes || undefined,
        });
      }

      await updateOrder.mutateAsync({
        id: order.id,
        subtotal: subtotal.toFixed(2),
        taxAmount: tax.toFixed(2),
        discountAmount: discount.toFixed(2),
        serviceCharge: serviceCharge.toFixed(2),
        tipAmount: tip.toFixed(2),
        total: total.toFixed(2),
        paymentMethod: method,
        paymentStatus: "paid",
        status: "preparing",
      });

      if (selectedTable) {
        await updateTable.mutateAsync({ id: Number(selectedTable), status: "occupied" });
      }

      toast.success(`Order ${order.id} placed successfully!`);
      setCart([]);
      setShowPayment(false);
      setDiscount(0);
      setTip(0);
      setCustomerName("");
      setSelectedTable("");
      utils.orders.list.invalidate();
      utils.tables.list.invalidate();
    } catch (err) {
      toast.error("Failed to create order");
    }
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-6rem)]">
      {/* Left: Menu */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-2xl font-bold tracking-tight">POS</h1>
          <Select value={orderType} onValueChange={(v: any) => setOrderType(v)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dine_in">Dine In</SelectItem>
              <SelectItem value="takeaway">Takeaway</SelectItem>
              <SelectItem value="delivery">Delivery</SelectItem>
              <SelectItem value="collection">Collection</SelectItem>
            </SelectContent>
          </Select>
          {orderType === "dine_in" && (
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Select table" />
              </SelectTrigger>
              <SelectContent>
                {tablesList?.filter(t => t.status === "free").map(t => (
                  <SelectItem key={t.id} value={String(t.id)}>{t.name} ({t.seats} seats)</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          <Button variant={selectedCategory === null ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(null)}>All</Button>
          {categories?.filter(c => c.isActive).map(cat => (
            <Button key={cat.id} variant={selectedCategory === cat.id ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat.id)}>
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Menu grid */}
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-accent/50 transition-all text-left group"
              >
                <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold text-primary">${Number(item.price).toFixed(2)}</span>
                  {item.isPopular && <Badge variant="secondary" className="text-xs">Popular</Badge>}
                </div>
              </button>
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No menu items found. Add items in Menu Management.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right: Cart */}
      <Card className="w-80 lg:w-96 flex flex-col bg-card border-border shrink-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Current Order
            {cart.length > 0 && <Badge variant="secondary">{cart.length}</Badge>}
          </CardTitle>
          <Input placeholder="Customer name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="mt-2" />
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 -mx-2 px-2">
            {cart.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">Tap items to add to order</p>
            ) : (
              <div className="space-y-2">
                {cart.map((item, i) => {
                  const itemTotal = (item.unitPrice + item.modifiers.reduce((m, mod) => m + mod.price, 0)) * item.quantity;
                  return (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">${item.unitPrice.toFixed(2)} ea</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(i, -1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(i, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="text-sm font-medium w-16 text-right">${itemTotal.toFixed(2)}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setCart(prev => prev.filter((_, idx) => idx !== i))}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Totals */}
          {cart.length > 0 && (
            <div className="border-t border-border pt-3 mt-3 space-y-1.5">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax (10%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Service (5%)</span><span>${serviceCharge.toFixed(2)}</span></div>
              {discount > 0 && <div className="flex justify-between text-sm text-success"><span>Discount</span><span>-${discount.toFixed(2)}</span></div>}
              <div className="flex justify-between text-base font-bold pt-1 border-t border-border">
                <span>Total</span><span className="text-primary">${total.toFixed(2)}</span>
              </div>
              <Button className="w-full mt-3" size="lg" onClick={() => setShowPayment(true)}>
                <Receipt className="h-4 w-4 mr-2" /> Charge ${total.toFixed(2)}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total Due</span><span className="text-primary">${total.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground">Discount ($)</label>
                <Input type="number" min={0} value={discount} onChange={e => setDiscount(Number(e.target.value))} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Tip ($)</label>
                <Input type="number" min={0} value={tip} onChange={e => setTip(Number(e.target.value))} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Button size="lg" className="flex flex-col gap-1 h-20" onClick={() => handlePayment("card")}>
                <CreditCard className="h-6 w-6" /><span className="text-xs">Card</span>
              </Button>
              <Button size="lg" variant="outline" className="flex flex-col gap-1 h-20" onClick={() => handlePayment("cash")}>
                <Banknote className="h-6 w-6" /><span className="text-xs">Cash</span>
              </Button>
              <Button size="lg" variant="outline" className="flex flex-col gap-1 h-20" onClick={() => handlePayment("split")}>
                <Receipt className="h-6 w-6" /><span className="text-xs">Split</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
