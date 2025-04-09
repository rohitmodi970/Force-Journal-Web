import React from 'react';

const DigitalJournal: React.FC = () => {
  const daysWithEntry: number[] = [21, 22, 23, 24, 27, 28];

  return (
    <div className="flex flex-col bg-gray-100 p-4 font-sans">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-black rounded-full" />
          ))}
          <span className="ml-2 font-semibold">MONTH OF FEBRUARY</span>
        </div>

        <div className="flex space-x-8 items-center">
          <span className="px-2 py-1 border border-gray-300 rounded text-xs">BOXED</span>
          <span className="px-2 py-1 border border-gray-300 rounded bg-gray-800 text-white text-xs">FREESTYLE</span>
          <span className="px-2 py-1 border border-gray-300 rounded text-xs">SCHEDULE</span>
          <div className="flex space-x-2">
            {['⌛', '✏️', '✨', '❤️', '🔍', '🔄', '●'].map((icon, i) => (
              <span key={i} className="cursor-pointer">{icon}</span>
            ))}
          </div>
        </div>

        <div className="cursor-pointer">
          <div className="flex flex-col items-center">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="w-1 h-1 bg-black rounded-full mb-1 last:mb-0" />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Calendar Section */}
        <div className="border border-gray-300 p-4 bg-white">
          <div className="font-bold mb-4">
            <span className="mr-2">♦️ FEBRUARY</span>
            <span className="text-rose-500">(END OF WINTER!)</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center mb-4">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
              <div key={day} className="text-xs font-semibold">{day}</div>
            ))}
            {[...Array(29)].map((_, i) => {
              const day = i + 1;
              const hasEntry = daysWithEntry.includes(day);
              return (
                <div
                  key={i}
                  className={`text-xs p-1 ${hasEntry ? 'bg-blue-100 border border-blue-300 rounded-full' : ''}`}
                >
                  {day}
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <img
              src="/api/placeholder/280/180"
              alt="Snow-capped mountains in Uttarakhand"
              className="object-cover rounded mb-2"
            />
            <div className="text-sm italic text-center">View from my window in Uttarakhand</div>
          </div>
        </div>

        {/* 21st Entry */}
        <div className="border border-gray-300 p-4 bg-white">
          <div className="font-bold mb-4">21 FRIDAY</div>
          <div className="flex justify-center">
            <div className="relative">
              <img
                src="/api/placeholder/200/150"
                alt="Handcrafted leather journal"
                className="object-cover rounded"
              />
              <div className="absolute -top-2 -right-2 transform rotate-12">
                <div className="bg-yellow-300 p-1 rounded">
                  <span className="text-xs">NEW JOURNAL!</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 text-sm">
            "First of all, I'm so excited that I've a new platform to write on. I have not written a lot in the past 2-3 weeks and it's because of various reasons."
          </div>
          <div className="flex justify-end mt-2">
            <div className="bg-yellow-200 w-6 h-6 flex items-center justify-center rounded-full">⭐</div>
          </div>
        </div>

        {/* 22nd Entry */}
        <div className="border border-gray-300 p-4 bg-white">
          <div className="font-bold mb-4">22 SATURDAY</div>
          <div className="flex items-start space-x-4">
            <img
              src="/api/placeholder/120/120"
              alt="Snow capped mountains"
              className="object-cover rounded"
            />
            <div className="flex-1">
              <div className="bg-blue-50 p-2 rounded mb-3">
                <span className="text-sm font-semibold">MEMORY REFLECTION</span>
              </div>
              <div className="text-sm">
                "I woke up this morning and as soon as I got out of the house, the first thing I saw were snow capped mountains. It reminds me of my childhood in Kashmir..."
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <div className="bg-yellow-200 w-6 h-6 flex items-center justify-center rounded-full">⭐</div>
          </div>
        </div>

        {/* 23rd Entry */}
        <div className="border border-gray-300 p-4 bg-white">
          <div className="font-bold mb-4">23 SUNDAY</div>
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 px-3 py-1 rounded-full text-green-800 text-sm">
              72 HOURS IN UTTRAKHAND
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '🌄', label: 'Nature' },
              { icon: '☀️', label: 'Morning Sun' },
              { icon: '🥗', label: 'Organic Food' },
              { icon: '🧘', label: 'Spiritual Growth' },
            ].map(({ icon, label }, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="bg-amber-100 p-2 rounded-full mb-1">
                  <span className="text-amber-800">{icon}</span>
                </div>
                <span className="text-xs">{label}</span>
              </div>
            ))}
          </div>
          <div className="text-sm mt-3 italic text-center">
            "Life is honestly beautiful. I'm content."
          </div>
          <div className="flex justify-end mt-2">
            <div className="bg-yellow-200 w-6 h-6 flex items-center justify-center rounded-full">⭐</div>
          </div>
        </div>

        {/* 24th Entry */}
        <div className="border border-gray-300 p-4 bg-white">
          <div className="font-bold mb-4">24 MONDAY</div>
          <div className="flex justify-between items-start">
            <div className="w-1/2">
              <div className="bg-purple-100 p-2 rounded mb-3">
                <span className="text-sm font-semibold text-purple-800">PROUD MOMENTS</span>
              </div>
              <ul className="text-xs space-y-2">
                {[
                  'Standing up for myself',
                  '40 days Shambhavi Mahamudra',
                  'Implementing my Stanford ML teaching experience with interns',
                  'Healthy daily routine',
                ].map((item, i) => (
                  <li key={i} className="flex items-center">
                    <span className="text-purple-500 mr-1">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <img
              src="/api/placeholder/120/120"
              alt="Meditation posture"
              className="object-cover rounded"
            />
          </div>
          <div className="border-t border-gray-200 mt-3 pt-3">
            <div className="bg-rose-100 p-2 rounded text-sm">
              "I want to shift my perspective to be nostalgic about the future. It's time to really get to know myself."
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <div className="bg-yellow-200 w-6 h-6 flex items-center justify-center rounded-full">⭐</div>
          </div>
        </div>

        {/* Change Section */}
        <div className="border border-gray-300 p-4 bg-white col-span-2">
          <div className="text-center font-bold mb-4">CHANGE</div>
          <div className="flex justify-between">
            {[
              {
                title: 'KOLKATA (Metropolitan)',
                img: '/api/placeholder/300/150',
                alt: 'Kolkata cityscape',
                text: "Moving to India and within that going back & forth between the small town of Uttarakhand and the metropolitan city of Kolkata...",
              },
              {
                title: 'UTTARAKHAND (Small Town)',
                img: '/api/placeholder/300/150',
                alt: 'Uttarakhand mountains',
                text: "The change of environment has also brought the change...",
              },
            ].map((item, i) => (
              <div key={i} className={`w-1/2 ${i === 0 ? 'pr-4' : 'pl-4'}`}>
                <img src={item.img} alt={item.alt} className="object-cover rounded mb-2" />
                <div className="text-xs font-bold mb-1">{item.title}</div>
                <div className="text-xs">{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalJournal;
