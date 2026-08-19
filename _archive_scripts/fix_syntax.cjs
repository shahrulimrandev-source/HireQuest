const fs = require('fs');
let content = fs.readFileSync('src/pages/SeekerDashboard.tsx', 'utf-8');

const target = `                            <div>
                              <h3 className="text-sm font-bold text-[#afafaf] uppercase tracking-wider mb-3">About Us</h3>
                              <p className="text-[#2a2a2a] leading-relaxed whitespace-pre-line">{viewingCompanyData.bio || 'No description provided.'}</p>
                            </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </AnimatePresence>
        </AnimatePresence>`;

const replacement = `                            <div>
                              <h3 className="text-sm font-bold text-[#afafaf] uppercase tracking-wider mb-3">About Us</h3>
                              <p className="text-[#2a2a2a] leading-relaxed whitespace-pre-line">{viewingCompanyData.bio || 'No description provided.'}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-6">
                            <div className="bg-gray-50 p-5 rounded-[15px] border border-gray-100">
                              <h3 className="text-sm font-bold text-[#afafaf] uppercase tracking-wider mb-4">Contact Info</h3>
                              <div className="flex flex-col gap-4">
                                {viewingCompanyData.location && (
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#22b3c1] flex items-center justify-center text-white shrink-0 shadow-sm"><MapPin size={14} /></div>
                                    <span className="text-sm font-medium text-[#2a2a2a]">{viewingCompanyData.location}</span>
                                  </div>
                                )}
                                {viewingCompanyData.email && (
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#2a2a2a] shrink-0"><Mail size={14} /></div>
                                    <a href={\`mailto:\${viewingCompanyData.email}\`} className="text-sm font-medium hover:text-[#22b3c1] text-[#2a2a2a] hover:underline truncate transition-colors">{viewingCompanyData.email}</a>
                                  </div>
                                )}
                                {viewingCompanyData.phone_number && (
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[#2a2a2a] shrink-0"><Phone size={14} /></div>
                                    <a href={\`tel:\${viewingCompanyData.phone_number}\`} className="text-sm font-medium hover:text-[#22b3c1] text-[#2a2a2a] hover:underline transition-colors">{viewingCompanyData.phone_number}</a>
                                  </div>
                                )}
                                {viewingCompanyData.website_link && (
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#22b3c1] flex items-center justify-center text-white shrink-0 shadow-sm"><Globe size={14} /></div>
                                    <a href={viewingCompanyData.website_link.startsWith('http') ? viewingCompanyData.website_link : \`https://\${viewingCompanyData.website_link}\`} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#22b3c1] hover:underline truncate">Website</a>
                                  </div>
                                )}
                                {viewingCompanyData.linkedin_link && (
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#22b3c1] flex items-center justify-center text-white shrink-0 shadow-sm"><Linkedin size={14} /></div>
                                    <a href={viewingCompanyData.linkedin_link.startsWith('http') ? viewingCompanyData.linkedin_link : \`https://\${viewingCompanyData.linkedin_link}\`} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#22b3c1] hover:underline truncate">LinkedIn</a>
                                  </div>
                                )}
                                {!viewingCompanyData.email && !viewingCompanyData.phone_number && !viewingCompanyData.website_link && !viewingCompanyData.linkedin_link && !viewingCompanyData.location && (
                                  <p className="text-sm text-muted-foreground italic">No contact info provided.</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </AnimatePresence>
        </AnimatePresence>`;

// Normalize newlines to avoid mismatch
const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedTarget = target.replace(/\r\n/g, '\n');
const normalizedReplacement = replacement.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedTarget)) {
  const newContent = normalizedContent.replace(normalizedTarget, normalizedReplacement);
  fs.writeFileSync('src/pages/SeekerDashboard.tsx', newContent);
  console.log("Syntax fixed!");
} else {
  console.log("Target block not found. Checking if there is a partial match...");
  const index = normalizedContent.indexOf('No description provided');
  console.log("Index of 'No description provided':", index);
  if (index > -1) {
    console.log(normalizedContent.substring(index, index + 300));
  }
}
