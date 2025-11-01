import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "./ui/button";

interface CompactGalleryProps {
  categories: Array<{
    category: string;
    images: string[];
  }>;
}

const CompactGallery: React.FC<CompactGalleryProps> = ({ categories }) => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.category || "");
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const categoryButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const currentCategory = categories.find(cat => cat.category === selectedCategory);

  // Check scroll position and update button visibility
  const checkScrollPosition = () => {
    if (!categoryScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  // Scroll category tabs horizontally
  const scrollCategories = (direction: "left" | "right") => {
    if (!categoryScrollRef.current) return;
    const scrollAmount = 200;
    const newScrollLeft = 
      direction === "left" 
        ? categoryScrollRef.current.scrollLeft - scrollAmount
        : categoryScrollRef.current.scrollLeft + scrollAmount;
    
    categoryScrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  };

  // Scroll to selected category when it changes
  useEffect(() => {
    if (!selectedCategory || !categoryButtonRefs.current.has(selectedCategory)) return;
    
    const button = categoryButtonRefs.current.get(selectedCategory);
    if (button && categoryScrollRef.current) {
      const container = categoryScrollRef.current;
      const buttonLeft = button.offsetLeft;
      const buttonWidth = button.offsetWidth;
      const containerWidth = container.clientWidth;
      const scrollLeft = container.scrollLeft;
      
      // Check if button is outside visible area
      if (buttonLeft < scrollLeft) {
        // Button is to the left, scroll to show it
        container.scrollTo({
          left: buttonLeft - 10,
          behavior: "smooth",
        });
      } else if (buttonLeft + buttonWidth > scrollLeft + containerWidth) {
        // Button is to the right, scroll to show it
        container.scrollTo({
          left: buttonLeft + buttonWidth - containerWidth + 10,
          behavior: "smooth",
        });
      }
    }
  }, [selectedCategory]);

  // Check scroll position on mount and resize
  useEffect(() => {
    checkScrollPosition();
    const handleResize = () => checkScrollPosition();
    window.addEventListener("resize", handleResize);
    
    const scrollContainer = categoryScrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScrollPosition);
    }
    
    return () => {
      window.removeEventListener("resize", handleResize);
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", checkScrollPosition);
      }
    };
  }, [categories]);

  const openModal = (img: string, idx: number) => {
    setModalImage(img);
    setModalIndex(idx);
  };

  const closeModal = () => {
    setModalImage(null);
    setModalIndex(null);
  };

  const showPrev = () => {
    if (modalIndex !== null && currentCategory) {
      const prevIdx = (modalIndex - 1 + currentCategory.images.length) % currentCategory.images.length;
      setModalImage(currentCategory.images[prevIdx]);
      setModalIndex(prevIdx);
    }
  };

  const showNext = () => {
    if (modalIndex !== null && currentCategory) {
      const nextIdx = (modalIndex + 1) % currentCategory.images.length;
      setModalImage(currentCategory.images[nextIdx]);
      setModalIndex(nextIdx);
    }
  };

  if (!categories.length) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        No images available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category Pills - Compact Design with Navigation */}
      <div className="relative">
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-md hover:bg-background"
            onClick={() => scrollCategories("left")}
            aria-label="Scroll categories left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        
        {/* Right Scroll Button */}
        {canScrollRight && (
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-md hover:bg-background"
            onClick={() => scrollCategories("right")}
            aria-label="Scroll categories right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
        
        {/* Scrollable Category Container */}
        <div 
          ref={categoryScrollRef}
          className="flex gap-2 overflow-x-auto pb-2 category-scrollbar"
          style={{ 
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(128, 128, 128, 0.3) transparent",
            paddingLeft: canScrollLeft ? "2.5rem" : "0",
            paddingRight: canScrollRight ? "2.5rem" : "0",
          }}
        >
          {categories.map(cat => (
            <button
              key={cat.category}
              ref={(el) => {
                if (el) {
                  categoryButtonRefs.current.set(cat.category, el);
                } else {
                  categoryButtonRefs.current.delete(cat.category);
                }
              }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                selectedCategory === cat.category
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setSelectedCategory(cat.category)}
            >
              {cat.category} <span className="text-xs opacity-70">({cat.images.length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Compact Image Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2"
        >
          {currentCategory?.images.slice(0, 12).map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.02, duration: 0.2 }}
              className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer bg-muted"
              onClick={() => openModal(img, idx)}
            >
              <img
                src={img}
                alt={`${selectedCategory} ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* View All Button */}
      {currentCategory && currentCategory.images.length > 12 && (
        <div className="text-center pt-2">
          <Button variant="outline" size="sm" onClick={() => openModal(currentCategory.images[0], 0)}>
            View All {currentCategory.images.length} Images
          </Button>
        </div>
      )}

      {/* Image Modal */}
      <AnimatePresence>
        {modalImage && modalIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="relative max-w-5xl max-h-[90vh] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={modalImage}
                src={modalImage}
                alt="Large preview"
                className="max-h-[85vh] max-w-full rounded-lg shadow-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
              
              {/* Navigation Arrows */}
              {currentCategory && currentCategory.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                    onClick={(e) => { e.stopPropagation(); showPrev(); }}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                    onClick={(e) => { e.stopPropagation(); showNext(); }}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
              
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-10 right-0 text-white hover:bg-white/20 rounded-full"
                onClick={(e) => { e.stopPropagation(); closeModal(); }}
              >
                <X className="h-5 w-5" />
              </Button>
              
              {/* Image Info */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md rounded-full px-3 py-1">
                <span className="text-white text-xs font-medium">
                  {modalIndex + 1} / {currentCategory?.images.length} - {selectedCategory}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompactGallery;

