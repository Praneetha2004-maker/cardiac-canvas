import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DataProvider } from "@/context/DataContext";
import { AppLayout } from "@/components/AppLayout";
import UploadPage from "./pages/Upload";
import Overview from "./pages/Overview";
import ClinicalView from "./pages/ClinicalView";
import PolicyView from "./pages/PolicyView";
import PatientProfile from "./pages/PatientProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route
              path="/overview"
              element={
                <AppLayout>
                  <Overview />
                </AppLayout>
              }
            />
            <Route
              path="/clinical"
              element={
                <AppLayout>
                  <ClinicalView />
                </AppLayout>
              }
            />
            <Route
              path="/policy"
              element={
                <AppLayout>
                  <PolicyView />
                </AppLayout>
              }
            />
            <Route
              path="/patient"
              element={
                <AppLayout>
                  <PatientProfile />
                </AppLayout>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
