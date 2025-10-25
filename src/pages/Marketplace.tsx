import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin } from "lucide-react";

export default function Marketplace() {
  const items = [
    {
      id: 1,
      title: "Baby Stroller - Like New",
      price: "€120",
      condition: "Excellent",
      seller: "Sarah Johnson",
      location: "Downtown, 2 km away",
      image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400",
      isFree: false
    },
    {
      id: 2,
      title: "Toddler Clothes Bundle (12-18m)",
      price: "Free",
      condition: "Good",
      seller: "Maria Papadopoulou",
      location: "Kolonaki, 1.5 km away",
      image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=400",
      isFree: true
    },
    {
      id: 3,
      title: "High Chair",
      price: "€45",
      condition: "Good",
      seller: "Emma Wilson",
      location: "Suburbs, 4 km away",
      image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400",
      isFree: false
    },
    {
      id: 4,
      title: "Baby Books Collection",
      price: "€20",
      condition: "Excellent",
      seller: "Anna Dimitriou",
      location: "City Center, 1 km away",
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
      isFree: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <div className="max-w-6xl mx-auto pt-20 pb-24 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
          <Button>List Item</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <button className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-secondary transition-colors">
                  <Heart className="w-5 h-5 text-primary" />
                </button>
                {item.isFree && (
                  <Badge className="absolute top-2 left-2 bg-mint text-mint-foreground">
                    Free
                  </Badge>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-foreground">{item.title}</h3>
                  <span className="font-bold text-primary">{item.price}</span>
                </div>

                <Badge variant="outline" className="mb-3">
                  {item.condition}
                </Badge>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{item.location}</span>
                  </div>
                  <p>Seller: {item.seller}</p>
                </div>

                <Button className="w-full mt-4" variant="outline">
                  Contact Seller
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
