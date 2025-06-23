import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useCurrency } from "@/components/CurrencyProvider";
import { getCurrencySymbol } from "@/utils/currency";

export default function CurrencySelector() {
  const { currency, setCurrency, supportedCurrencies } = useCurrency();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Globe className="w-4 h-4 mr-2" />
          {getCurrencySymbol(currency)} {currency}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {supportedCurrencies.map((curr) => (
          <DropdownMenuItem
            key={curr.code}
            onClick={() => setCurrency(curr.code)}
            className={`cursor-pointer ${
              currency === curr.code ? 'bg-accent text-accent-foreground' : ''
            }`}
          >
            <span className="mr-2">{curr.symbol}</span>
            <span className="flex-1">{curr.name}</span>
            <span className="text-sm text-muted-foreground">{curr.code}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}