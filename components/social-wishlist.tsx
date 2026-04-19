/**
 * Social Wishlist Component (2026)
 */

'use client';

import { useEffect, useState } from 'react';
import { Heart, Share2, Copy, Mail } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function SocialWishlist({ userId }: { userId?: string }) {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareMode, setShareMode] = useState(false);
  const [shareEmails, setShareEmails] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchWishlist = async () => {
      try {
        const res = await fetch(`/api/personalization?user_id=${userId}&action=wishlist`);
        const data = await res.json();
        setWishlistItems(data.items || []);
        setShareUrl(data.share_url);
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [userId]);

  const handleShare = async () => {
    if (!shareEmails || !userId) return;

    try {
      await fetch('/api/personalization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'share_wishlist',
          user_id: userId,
          emails: shareEmails.split(',').map(e => e.trim()),
          message: 'Check out my wishlist!'
        })
      });

      alert('Wishlist shared!');
      setShareEmails('');
      setShareMode(false);
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <div>Loading wishlist...</div>;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="text-red-500" fill="currentColor" />
          Your Wishlist
        </h2>
        <button
          onClick={() => setShareMode(!shareMode)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Share2 size={18} />
          Share
        </button>
      </div>

      {/* Share Mode */}
      {shareMode && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Share with friends (emails):</label>
              <input
                type="email"
                multiple
                placeholder="friend1@email.com, friend2@email.com"
                value={shareEmails}
                onChange={e => setShareEmails(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Mail size={18} />
                Send Emails
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                <Copy size={18} />
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wishlist Items */}
      {wishlistItems.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Your wishlist is empty</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map(item => (
            <Link
              key={item.product.id}
              href={`/product/${item.product.slug}`}
              className="group"
            >
              <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden mb-3">
                {item.product.image_url && (
                  <Image
                    src={item.product.image_url}
                    alt={item.product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                )}
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2">
                {item.product.name}
              </h3>
              <div className="flex items-center justify-between mt-2">
                <p className="text-lg font-bold text-gray-900">
                  R$ {item.product.price?.toFixed(2)}
                </p>
                {item.product.discount_percentage && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
                    -{item.product.discount_percentage}%
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default SocialWishlist;
