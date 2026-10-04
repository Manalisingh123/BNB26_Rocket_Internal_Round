import React, { useState } from 'react';
import { VaultAsset } from '../types/heirloom';
import { ArchivalStamp } from './ArchivalSeal';
import { Plus, Search, ArrowRight, X, CheckCircle2 } from 'lucide-react';

interface MyVaultViewProps {
  assets: VaultAsset[];
  onSelectAsset: (assetId: string) => void;
  onCreateAsset: (newAsset: {
    title: string;
    subtitle: string;
    category: VaultAsset['category'];
    beneficiaryName: string;
    summaryDescription: string;
    plaintextSecret: string;
  }) => Promise<void>;
}

export const MyVaultView: React.FC<MyVaultViewProps> = ({
  assets,
  onSelectAsset,
  onCreateAsset
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSealing, setIsSealing] = useState(false);
  const [sealSuccessMessage, setSealSuccessMessage] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCategory, setNewCategory] = useState<VaultAsset['category']>('Estate Directive');
  const [newBeneficiary, setNewBeneficiary] = useState('Hannah Vance');
  const [newDescription, setNewDescription] = useState('');
  const [newPlaintext, setNewPlaintext] = useState('');

  const categories = [
    'ALL',
    'Estate Directive',
    'Cryptographic Custody',
    'Corporate Succession',
    'Personal Correspondence'
  ];

  const filteredAssets = assets.filter((asset) => {
    const matchesCategory = selectedCategory === 'ALL' || asset.category === selectedCategory;
    const matchesSearch =
      asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.accessionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPlaintext.trim()) return;
    setIsSealing(true);
    try {
      await onCreateAsset({
        title: newTitle.trim(),
        subtitle:
          newSubtitle.trim() || 'Sealed digital record protected under 2-of-3 guardian quorum',
        category: newCategory,
        beneficiaryName: newBeneficiary.trim() || 'Hannah Vance',
        summaryDescription:
          newDescription.trim() ||
          'Client-side encrypted archival record bound to the 2-of-3 guardian quorum and 72-hour challenge window.',
        plaintextSecret: newPlaintext.trim()
      });

      setSealSuccessMessage(
        `"${newTitle.trim()}" has been encrypted in your browser with AES-256-GCM, split into 2-of-3 guardian key shares, and sealed in your archive.`
      );
      setIsModalOpen(false);
      setNewTitle('');
      setNewSubtitle('');
      setNewDescription('');
      setNewPlaintext('');
      setTimeout(() => setSealSuccessMessage(null), 6000);
    } finally {
      setIsSealing(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Calm Header with Single Primary Action */}
      <div className="border-b border-[#DED9CE] pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#77736A]">
            Private Digital Archive
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-normal text-[#242421]">
            My Vault
          </h1>
          <p className="text-base text-[#77736A] leading-relaxed">
            Each record is encrypted in your browser and sealed inside an archival container. Open any record to inspect its policy or initiate recovery.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3.5 bg-[#242421] text-[#F7F4ED] text-xs font-medium uppercase tracking-[0.14em] hover:bg-[#30483B] transition-colors inline-flex items-center gap-2.5 self-start sm:self-auto cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Preserve a Record</span>
        </button>
      </div>

      {sealSuccessMessage && (
        <div className="p-4 border border-[#30483B] bg-[#E8EFEA] flex items-center justify-between gap-4 text-xs text-[#30483B]">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{sealSuccessMessage}</span>
          </div>
          <ArchivalStamp state="SEALED" size="sm" />
        </div>
      )}

      {/* Secondary Quiet Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#242421] text-[#F7F4ED]'
                  : 'text-[#77736A] hover:text-[#242421] bg-[#EFECE4]/60'
              }`}
            >
              {cat === 'ALL' ? `All (${assets.length})` : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-[#77736A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#EFECE4]/60 border border-[#DED9CE] text-[#242421] placeholder-[#77736A] focus:outline-none focus:border-[#242421]"
          />
        </div>
      </div>

      {/* Clean Scannable Archive List / Cards */}
      {filteredAssets.length === 0 ? (
        <div className="border border-[#DED9CE] bg-[#EFECE4]/40 p-12 text-center space-y-4">
          <div className="font-serif text-2xl text-[#242421]">
            No matching archival records found
          </div>
          <p className="text-sm text-[#77736A] max-w-md mx-auto">
            Try clearing your filter or preserve a new encrypted record into your vault.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSearchQuery('');
            }}
            className="px-4 py-2 border border-[#242421] text-xs font-mono uppercase tracking-wider text-[#242421] hover:bg-[#242421] hover:text-[#F7F4ED] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAssets.map((asset) => (
            <article
              key={asset.id}
              onClick={() => onSelectAsset(asset.id)}
              className="border border-[#DED9CE] bg-[#EFECE4]/40 hover:bg-[#EFECE4]/80 hover:border-[#242421]/40 transition-colors p-7 flex flex-col justify-between cursor-pointer group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-mono text-[#77736A] uppercase tracking-wider">
                    {asset.accessionNumber} · {asset.category}
                  </span>
                  <ArchivalStamp state={asset.protectionState} size="sm" />
                </div>

                <div className="space-y-2">
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#242421] group-hover:text-[#30483B] transition-colors leading-snug">
                    {asset.title}
                  </h2>
                  <p className="text-sm text-[#77736A] leading-relaxed">
                    {asset.subtitle}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-[#DED9CE] flex items-center justify-between text-xs text-[#77736A]">
                <span>
                  Beneficiary: <strong className="text-[#242421] font-normal">{asset.beneficiaryName}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono uppercase tracking-wider text-[#242421] group-hover:text-[#30483B] whitespace-nowrap">
                  <span>Open Record</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal: Preserve & Seal a New Record (Real Browser Encryption) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#242421]/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#F7F4ED] border border-[#242421] max-w-xl w-full p-7 sm:p-9 space-y-6 my-8">
            <div className="flex items-start justify-between border-b border-[#DED9CE] pb-4">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-[#77736A]">
                  Client-Side Encryption & 2-of-3 Split
                </div>
                <h2 className="font-serif text-3xl text-[#242421] mt-1">
                  Preserve a New Record
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#77736A] hover:text-[#242421] cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSealSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#77736A] mb-1.5">
                  Record Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Family Vault Coordinates & Executor Letter"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#EFECE4]/70 border border-[#DED9CE] text-[#242421] focus:outline-none focus:border-[#242421]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#77736A] mb-1.5">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as VaultAsset['category'])}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#EFECE4]/70 border border-[#DED9CE] text-[#242421] focus:outline-none focus:border-[#242421]"
                  >
                    <option value="Estate Directive">Estate Directive</option>
                    <option value="Cryptographic Custody">Cryptographic Custody</option>
                    <option value="Corporate Succession">Corporate Succession</option>
                    <option value="Personal Correspondence">Personal Correspondence</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#77736A] mb-1.5">
                    Designated Beneficiary
                  </label>
                  <input
                    type="text"
                    value={newBeneficiary}
                    onChange={(e) => setNewBeneficiary(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#EFECE4]/70 border border-[#DED9CE] text-[#242421] focus:outline-none focus:border-[#242421]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#77736A] mb-1.5">
                  Public Summary (Visible Before Decryption)
                </label>
                <input
                  type="text"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder="Brief description of what this container holds..."
                  className="w-full px-3.5 py-2.5 text-sm bg-[#EFECE4]/70 border border-[#DED9CE] text-[#242421] focus:outline-none focus:border-[#242421]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#30483B] mb-1.5">
                  Confidential Record Contents (Encrypted in Browser with AES-256-GCM) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={newPlaintext}
                  onChange={(e) => setNewPlaintext(e.target.value)}
                  placeholder="Enter the sensitive instructions, coordinates, or letter to be sealed. This plaintext is encrypted locally and never stored unencrypted..."
                  className="w-full px-3.5 py-2.5 text-sm bg-[#EFECE4]/70 border border-[#DED9CE] text-[#242421] focus:outline-none focus:border-[#242421] font-mono"
                />
              </div>

              <div className="p-3.5 border border-[#DED9CE] bg-[#EFECE4] text-xs text-[#77736A]">
                Upon sealing, the master AES-256-GCM key is split into 3 threshold shares across your guardians (<strong>Dr. Clara Vance</strong>, <strong>Marcus Sterling</strong>, and <strong>Elena Rostova</strong>) and discarded.
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-[#77736A] hover:text-[#242421] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSealing}
                  className="px-6 py-3 bg-[#30483B] text-[#F7F4ED] text-xs font-mono uppercase tracking-wider hover:bg-[#242421] transition-colors cursor-pointer"
                >
                  {isSealing ? 'Encrypting & Splitting Key...' : 'Encrypt & Seal Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
