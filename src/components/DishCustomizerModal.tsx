import React, { useState } from 'react';
import { X, Plus, Minus, Check, Flame } from 'lucide-react';
import { MenuItem, SelectedCustomization, CartItem } from '../types';

interface DishCustomizerModalProps {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

export const DishCustomizerModal: React.FC<DishCustomizerModalProps> = ({
  item,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Track selected options: groupId -> SelectedCustomization[]
  const [selectedOptions, setSelectedOptions] = useState<Record<string, SelectedCustomization[]>>(() => {
    const initial: Record<string, SelectedCustomization[]> = {};
    if (item.customizationGroups) {
      item.customizationGroups.forEach((group) => {
        if (group.type === 'radio' && group.options.length > 0) {
          // Select first option by default
          initial[group.id] = [
            {
              groupId: group.id,
              groupTitle: group.title,
              optionId: group.options[0].id,
              name: group.options[0].name,
              price: group.options[0].price,
            },
          ];
        } else {
          initial[group.id] = [];
        }
      });
    }
    return initial;
  });

  const handleRadioChange = (groupId: string, groupTitle: string, optionId: string, name: string, price: number) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupId]: [{ groupId, groupTitle, optionId, name, price }],
    }));
  };

  const handleCheckboxToggle = (groupId: string, groupTitle: string, optionId: string, name: string, price: number) => {
    setSelectedOptions((prev) => {
      const current = prev[groupId] || [];
      const exists = current.some((c) => c.optionId === optionId);
      if (exists) {
        return {
          ...prev,
          [groupId]: current.filter((c) => c.optionId !== optionId),
        };
      } else {
        return {
          ...prev,
          [groupId]: [...current, { groupId, groupTitle, optionId, name, price }],
        };
      }
    });
  };

  // Flatten customizations
  const allSelectedCustomizations: SelectedCustomization[] = Object.values(selectedOptions).flat();

  // Unit price with selected customizations
  const extraCost = allSelectedCustomizations.reduce((sum, c) => sum + c.price, 0);
  const unitPrice = item.price + extraCost;
  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
    // Generate unique key
    const customKey = allSelectedCustomizations
      .map((c) => c.optionId)
      .sort()
      .join('-');
    const cartItemId = `${item.id}-${customKey || 'standard'}`;

    const cartItem: CartItem = {
      cartItemId,
      item,
      quantity,
      selectedCustomizations: allSelectedCustomizations,
      itemTotal: Number(totalPrice.toFixed(2)),
      specialInstructions: specialInstructions.trim() || undefined,
    };

    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="relative p-5 border-b border-gray-100 flex items-start justify-between gap-3 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 shrink-0 shadow-xs">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${
                    item.dietary === 'veg' || item.dietary === 'vegan'
                      ? 'border-emerald-600'
                      : 'border-red-600'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.dietary === 'veg' || item.dietary === 'vegan'
                        ? 'bg-emerald-600'
                        : 'bg-red-600'
                    }`}
                  />
                </span>
                <h3 className="font-bold text-gray-900 text-base leading-snug">{item.name}</h3>
              </div>
              <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{item.description}</p>
              <div className="text-xs font-bold text-orange-600 mt-1">
                Base price: ${item.price.toFixed(2)}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200/80 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Customization Options */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 divide-y divide-gray-100">
          {item.customizationGroups && item.customizationGroups.length > 0 ? (
            item.customizationGroups.map((group) => {
              const currentGroupSelections = selectedOptions[group.id] || [];

              return (
                <div key={group.id} className="pt-4 first:pt-0">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-extrabold text-sm text-gray-900">
                      {group.title}
                    </h4>
                    <span className="text-[11px] font-semibold text-gray-400">
                      {group.type === 'radio' ? 'Select 1 option' : 'Optional add-ons'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {group.options.map((option) => {
                      const isSelected = currentGroupSelections.some((c) => c.optionId === option.id);

                      return (
                        <div
                          key={option.id}
                          onClick={() => {
                            if (group.type === 'radio') {
                              handleRadioChange(group.id, group.title, option.id, option.name, option.price);
                            } else {
                              handleCheckboxToggle(group.id, group.title, option.id, option.name, option.price);
                            }
                          }}
                          className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-orange-50/70 border-orange-500 shadow-xs'
                              : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-${group.type === 'radio' ? 'full' : 'lg'} border flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-orange-500 border-orange-500 text-white'
                                  : 'border-gray-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <span className="text-xs font-bold text-gray-800">{option.name}</span>
                          </div>

                          <span className="text-xs font-semibold text-gray-600">
                            {option.price === 0 ? 'Free' : `+$${option.price.toFixed(2)}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-2 text-center text-xs text-gray-500">
              No extra toppings available for this item. Add cooking notes below if needed.
            </div>
          )}

          {/* Special Instructions */}
          <div className="pt-4">
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              Special Cooking Instructions (Optional)
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Less spicy, dressing on side, no cutlery needed"
              maxLength={150}
              className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-hidden focus:border-orange-500 bg-gray-50/50"
            />
          </div>
        </div>

        {/* Footer: Quantity & Add Button */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4">
          {/* Quantity selector */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl p-1 shadow-xs">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 flex items-center justify-center text-gray-700 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center text-xs font-black text-gray-900">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-xl bg-orange-50 hover:bg-orange-100 flex items-center justify-center text-orange-600 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-md shadow-orange-500/25 flex items-center justify-between transition-all active:scale-[0.99]"
          >
            <span>Add Item</span>
            <span>${totalPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
