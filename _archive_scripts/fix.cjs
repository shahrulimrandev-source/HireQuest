const fs = require('fs');
const lines = fs.readFileSync('src/pages/SeekerDashboard.tsx', 'utf-8').split('\n');

const newLines = [
  ...lines.slice(0, 1608),
  '                  <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">',
  '                    <button type="submit" className="px-12 py-3.5 bg-[#22b3c1] text-white rounded-[23px] font-bold text-lg hover:bg-[#1d97a3] transition-colors shadow-md hover:shadow-lg">',
  '                      Save Changes',
  '                    </button>',
  '                    <button type="button" onClick={() => setIsEditingProfile(false)} className="px-12 py-3.5 bg-white text-[#2a2a2a] rounded-[23px] font-bold text-lg hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm">',
  '                      Cancel',
  '                    </button>',
  '                  </div>',
  '                </form>',
  '              )}',
  '            </div>',
  '          </div>',
  '        )}',
  '',
  ...lines.slice(1817)
];

fs.writeFileSync('src/pages/SeekerDashboard.tsx', newLines.join('\n'));
