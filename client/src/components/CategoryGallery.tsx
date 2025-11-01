import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "./ui/button";

interface CategoryGalleryProps {
  categories: Array<{
    category: string;
    images: string[];
  }>;
}

const CategoryGallery: React.FC<CategoryGalleryProps> = ({ categories }) => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.category || "");
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  const currentCategory = categories.find(cat => cat.category === selectedCategory);

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
      <div className="text-center py-8 text-muted-foreground">
        No images available for this property.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Category Selection */}
      <div className="space-y-4">
        {/* Mobile: Horizontal Scrollable */}
        <div className="md:hidden">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <motion.button
                key={cat.category}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === cat.category
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border"
                }`}
                onClick={() => setSelectedCategory(cat.category)}
                whileTap={{ scale: 0.95 }}
              >
                {cat.category} ({cat.images.length})
              </motion.button>
            ))}
          </div>
        </div>
        
        {/* Desktop: Centered Layout */}
        <div className="hidden md:flex flex-wrap gap-3 justify-center">
          {categories.map(cat => (
            <motion.button
              key={cat.category}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                selectedCategory === cat.category
                  ? "bg-primary text-primary-foreground shadow-lg scale-105"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border hover:shadow-md"
              }`}
              onClick={() => setSelectedCategory(cat.category)}
              whileHover={{ scale: selectedCategory === cat.category ? 1.05 : 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {cat.category} ({cat.images.length})
            </motion.button>
          ))}
        </div>
      </div>

      {/* Enhanced Image Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4"
        >
          {currentCategory?.images.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer bg-muted"
              onClick={() => openModal(img, idx)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <img
                src={img}
                alt={`${selectedCategory} ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3">
                <span className="text-white text-sm font-medium">
                  View Image {idx + 1}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Enhanced Modal */}
      <AnimatePresence>
        {modalImage && modalIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-5xl max-h-[90vh] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={modalImage}
                src={modalImage}
                alt="Large preview"
                className="max-h-[85vh] max-w-full rounded-lg shadow-2xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Navigation Arrows */}
              {currentCategory && currentCategory.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
                    onClick={(e) => { e.stopPropagation(); showPrev(); }}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
                    onClick={(e) => { e.stopPropagation(); showNext(); }}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
              
              {/* Close Button */}
              <Button
                variant="ghost"
                size="lg"
                className="absolute -top-12 right-0 text-white hover:bg-white/20 rounded-full p-2"
                onClick={(e) => { e.stopPropagation(); closeModal(); }}
              >
                <X className="h-6 w-6" />
              </Button>
              
              {/* Image Info */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md rounded-full px-4 py-2">
                <span className="text-white text-sm font-medium">
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

export default CategoryGallery;