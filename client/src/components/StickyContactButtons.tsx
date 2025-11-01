import { MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StickyContactButtons() {
	const whatsappNumber = "+254700000000";
	const phoneNumber = "+254700000000";

	const handleWhatsAppClick = () => {
		const message = "Hi, I'm interested in your properties";
		const whatsappUrl = `https://wa.me/${whatsappNumber.replace("+", "")}?text=${encodeURIComponent(
			message
		)}`;
		window.open(whatsappUrl, "_blank");
	};

	const handlePhoneClick = () => {
		window.location.href = `tel:${phoneNumber}`;
	};

	return (
		<div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
			<Button
				onClick={handleWhatsAppClick}
				className="bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 w-14 h-14 backdrop-blur-sm border border-border"
				size="icon"
			>
				<MessageCircle className="h-5 w-5" />
			</Button>
			<Button
				onClick={handlePhoneClick}
				variant="default"
				className="p-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 w-14 h-14 backdrop-blur-sm border border-border"
				size="icon"
			>
				<Phone className="h-5 w-5" />
			</Button>
		</div>
	);
}
