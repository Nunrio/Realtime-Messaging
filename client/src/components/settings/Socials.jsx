import React from 'react';
import { Facebook, Twitter, Instagram, Github, Link2 } from 'lucide-react';

const Socials = () => {
  const socialPlatforms = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      connected: false,
      placeholder: 'https://facebook.com/username',
    },
    {
      id: 'twitter',
      name: 'Twitter / X',
      icon: Twitter,
      connected: false,
      placeholder: 'https://x.com/username',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      connected: false,
      placeholder: 'https://instagram.com/username',
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: Github,
      connected: false,
      placeholder: 'https://github.com/username',
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
<h1 className="text-lg font-bold text-gray-900">Socials</h1>
        <p className="text-gray-500 mt-1">Link your social media accounts</p>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <Link2 size={48} className="mx-auto text-blue-400 mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h2>
        <p className="text-gray-600">
          Social media linking feature is under development. Check back later!
        </p>
      </div>

      {/* Future Implementation Preview */}
      <div className="mt-8">
<h2 className="text-base font-semibold text-gray-900 mb-4">Future Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {socialPlatforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <div
                key={platform.id}
                className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50 opacity-60"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <Icon size={20} className="text-gray-500" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-700">{platform.name}</p>
                  <p className="text-xs text-gray-400">Not connected</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Socials;

