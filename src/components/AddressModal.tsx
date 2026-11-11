import React, { useState } from 'react';
import { X, MapPin, Plus, Check, Home, Briefcase, Navigation } from 'lucide-react';
import { DeliveryAddress } from '../types';
import { saveAddress } from '../services/api';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: DeliveryAddress[];
  currentAddress: DeliveryAddress | null;
  onSelectAddress: (addr: DeliveryAddress) => void;
  onAddressAdded: (newAddr: DeliveryAddress) => void;
}

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  addresses,
  currentAddress,
  onSelectAddress,
  onAddressAdded,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('New York, NY');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressLine1.trim()) return;

    setSubmitting(true);
    try {
      const added = await saveAddress({
        label,
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim() || undefined,
        landmark: landmark.trim() || undefined,
        city: city.trim(),
        isDefault: false,
      });

      onAddressAdded(added);
      onSelectAddress(added);
      setShowAddForm(false);
      setAddressLine1('');
      setAddressLine2('');
      setLandmark('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-100 flex flex-col my-8">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900">Delivery Location</h3>
              <p className="text-xs text-gray-400 font-medium">Choose or add your delivery address</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200/80 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          {!showAddForm ? (
            <>
              {/* Saved Addresses List */}
              <div className="space-y-3">
                {addresses.map((addr) => {
                  const isSelected = currentAddress?.id === addr.id;

                  return (
                    <div
                      key={addr.id}
                      onClick={() => {
                        onSelectAddress(addr);
                        onClose();
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/50 ring-1 ring-orange-500'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {addr.label === 'Home' ? (
                            <Home className="w-4 h-4" />
                          ) : addr.label === 'Work' ? (
                            <Briefcase className="w-4 h-4" />
                          ) : (
                            <Navigation className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-gray-900">
                              {addr.label}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-orange-100 text-orange-700">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                            {addr.addressLine1}
                            {addr.addressLine2 && `, ${addr.addressLine2}`}
                          </p>
                          <span className="text-[11px] text-gray-400 font-medium">
                            {addr.city}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-orange-500 border-orange-500 text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Address Button */}
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-300 hover:border-orange-500 text-gray-700 hover:text-orange-600 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Address</span>
              </button>
            </>
          ) : (
            /* Add Address Form */
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Save Address As
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Home', 'Work', 'Other'] as const).map((l) => (
                    <button
                      type="button"
                      key={l}
                      onClick={() => setLabel(l)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        label === l
                          ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Street Address & Flat / House No. *
                </label>
                <input
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="e.g. Apt 12B, 350 Hudson Street"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Building / Area Name (Optional)
                </label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="e.g. Greenwich Village"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nearby Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Near Metro Stn"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    City / Zip *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. New York, NY"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  {submitting ? 'Saving...' : 'Save & Select Address'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
