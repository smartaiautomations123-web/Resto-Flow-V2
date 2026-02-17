import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import KDS from "./pages/KDS";
import MenuManagement from "./pages/MenuManagement";
import Inventory from "./pages/Inventory";
import StaffManagement from "./pages/StaffManagement";
import Reports from "./pages/Reports";
import Suppliers from "./pages/Suppliers";
import Customers from "./pages/Customers";
import Reservations from "./pages/Reservations";
import OnlineOrdering from "./pages/OnlineOrdering";
import TableOrdering from "./pages/TableOrdering";
import PriceUploads from "./pages/PriceUploads";
import FloorPlan from "./pages/FloorPlan";
import ZReports from "./pages/ZReports";
import VoidRefunds from "./pages/VoidRefunds";
import QRCodeGenerator from "./pages/QRCodeGenerator";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/order" component={OnlineOrdering} />
      <Route path="/table/:tableId" component={TableOrdering} />
      {/* Dashboard routes */}
      <Route path="/" component={() => <DashboardLayout><Dashboard /></DashboardLayout>} />
      <Route path="/pos" component={() => <DashboardLayout><POS /></DashboardLayout>} />
      <Route path="/kds" component={() => <DashboardLayout><KDS /></DashboardLayout>} />
      <Route path="/menu" component={() => <DashboardLayout><MenuManagement /></DashboardLayout>} />
      <Route path="/inventory" component={() => <DashboardLayout><Inventory /></DashboardLayout>} />
      <Route path="/staff" component={() => <DashboardLayout><StaffManagement /></DashboardLayout>} />
      <Route path="/reports" component={() => <DashboardLayout><Reports /></DashboardLayout>} />
      <Route path="/suppliers" component={() => <DashboardLayout><Suppliers /></DashboardLayout>} />
      <Route path="/customers" component={() => <DashboardLayout><Customers /></DashboardLayout>} />
      <Route path="/reservations" component={() => <DashboardLayout><Reservations /></DashboardLayout>} />
      <Route path="/price-uploads" component={() => <DashboardLayout><PriceUploads /></DashboardLayout>} />
      <Route path="/floor-plan" component={() => <DashboardLayout><FloorPlan /></DashboardLayout>} />
      <Route path="/z-reports" component={() => <DashboardLayout><ZReports /></DashboardLayout>} />
      <Route path="/void-refunds" component={() => <DashboardLayout><VoidRefunds /></DashboardLayout>} />
      <Route path="/qr-codes" component={() => <DashboardLayout><QRCodeGenerator /></DashboardLayout>} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster richColors />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
