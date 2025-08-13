import Home from "./Home";
import { useReferralTracking } from "@/hooks/useReferralTracking";

const Index = () => {
  useReferralTracking();
  return <Home />;
};

export default Index;
