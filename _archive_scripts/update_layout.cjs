const fs = require('fs');

let content = fs.readFileSync('src/pages/SeekerDashboard.tsx', 'utf-8');

const target1 = `                  {/* Bottom Section - File Uploads */}
                  <div className="space-y-6 bg-gray-50 p-8 rounded-[23px] border border-gray-200">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-[#2a2a2a]"><Upload className="text-[#22b3c1]"/> Upload New Documents</h3>
                    <p className="text-[#afafaf] mb-6">Uploading a new file will overwrite your existing document of that type.</p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white p-5 rounded-[23px] border border-gray-100 shadow-sm">
                        <label className="text-sm font-bold mb-3 flex items-center justify-between text-[#2a2a2a]">
                          <span className="flex items-center gap-2"><ImageIcon size={16} className="text-[#22b3c1]"/> Profile Picture</span>
                          {croppedImageBlob && <span className="text-[10px] uppercase tracking-wider font-bold bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-[23px]">Cropped Ready</span>}
                        </label>
                        <input type="file" name="profile_picture" accept="image/*" onChange={handleProfileImageSelect} className="w-full text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-[23px] file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-[#22b3c1]/10 file:text-[#22b3c1] hover:file:bg-[#22b3c1]/20 cursor-pointer text-[#afafaf]" />
                      </div>
                      <div className="bg-white p-5 rounded-[23px] border border-gray-100 shadow-sm">
                        <label className="text-sm font-bold mb-3 flex items-center gap-2 text-[#2a2a2a]"><ImageIcon size={16} className="text-[#22b3c1]"/> Banner Image</label>
                        <input type="file" name="banner" accept="image/*" className="w-full text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-[23px] file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-[#22b3c1]/10 file:text-[#22b3c1] hover:file:bg-[#22b3c1]/20 cursor-pointer text-[#afafaf]" />
                      </div>
                      <div className="bg-white p-5 rounded-[23px] border border-gray-100 shadow-sm">
                        <label className="text-sm font-bold mb-3 flex items-center gap-2 text-[#2a2a2a]"><FileText size={16} className="text-[#22b3c1]"/> Resume (PDF)</label>
                        <input type="file" name="resume" accept="application/pdf" className="w-full text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-[23px] file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-[#22b3c1]/10 file:text-[#22b3c1] hover:file:bg-[#22b3c1]/20 cursor-pointer text-[#afafaf]" />
                      </div>
                    </div>
                  </div>`;

const replacement1 = `                  {/* Bottom Section - Visual Assets */}
                  <div className="space-y-6 bg-gray-50 p-8 rounded-[23px] border border-gray-200">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-[#2a2a2a]"><ImageIcon className="text-[#22b3c1]"/> Visual Assets</h3>
                    <p className="text-[#afafaf] mb-6">Update your profile picture and banner image to personalize your account.</p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white p-5 rounded-[23px] border border-gray-100 shadow-sm">
                        <label className="text-sm font-bold mb-3 flex items-center justify-between text-[#2a2a2a]">
                          <span className="flex items-center gap-2"><ImageIcon size={16} className="text-[#22b3c1]"/> Profile Picture</span>
                          {croppedImageBlob && <span className="text-[10px] uppercase tracking-wider font-bold bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-[23px]">Cropped Ready</span>}
                        </label>
                        <input type="file" name="profile_picture" accept="image/*" onChange={handleProfileImageSelect} className="w-full text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-[23px] file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-[#22b3c1]/10 file:text-[#22b3c1] hover:file:bg-[#22b3c1]/20 cursor-pointer text-[#afafaf]" />
                      </div>
                      <div className="bg-white p-5 rounded-[23px] border border-gray-100 shadow-sm">
                        <label className="text-sm font-bold mb-3 flex items-center gap-2 text-[#2a2a2a]"><ImageIcon size={16} className="text-[#22b3c1]"/> Banner Image</label>
                        <input type="file" name="banner" accept="image/*" className="w-full text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-[23px] file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-[#22b3c1]/10 file:text-[#22b3c1] hover:file:bg-[#22b3c1]/20 cursor-pointer text-[#afafaf]" />
                      </div>
                    </div>
                  </div>

                  {/* My Resume Section */}
                  <div className="mt-12 pt-10 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                      <div>
                        <h3 className="text-2xl font-bold text-[#172b4d] flex items-center gap-2"><FileText className="text-[#22b3c1]" /> My Resume</h3>
                        <p className="text-sm text-gray-500 mt-1">Upload your latest resume for employers to view.</p>
                      </div>
                      <label className="px-6 py-3 bg-[#22b3c1] text-white rounded-[23px] font-bold text-sm shadow-md hover:bg-[#1d97a3] cursor-pointer transition-colors flex items-center gap-2">
                        <Upload size={18} /> Upload Resume
                        <input type="file" name="resume" className="hidden" accept="application/pdf" onChange={e => {
                          if (e.target.files && e.target.files.length > 0) {
                            setSelectedResumeName(e.target.files[0].name);
                          }
                        }} />
                      </label>
                    </div>

                    {selectedResumeName ? (
                      <div className="bg-blue-50 rounded-[23px] border border-blue-200 p-6 shadow-sm flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 shrink-0">
                           <FileText size={24} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-[#2a2a2a]">{selectedResumeName}</h4>
                          <p className="text-sm text-blue-600 font-bold">Ready to be saved (click Save Changes below)</p>
                        </div>
                      </div>
                    ) : user.resume ? (
                      <div className="bg-white rounded-[23px] border border-gray-200 p-6 shadow-sm flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-[#22b3c1] shrink-0">
                             <FileText size={24} />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-[#2a2a2a]">Current Resume</h4>
                            <a href={user.resume.startsWith('http') ? user.resume : \`http://localhost:5000\${user.resume}\`} target="_blank" rel="noreferrer" className="text-sm font-bold text-[#22b3c1] hover:underline">View PDF</a>
                          </div>
                        </div>
                        <button type="button" onClick={() => handleRemoveFile('resume')} className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-full transition-colors" title="Remove Resume">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-[23px] p-8 text-center border border-dashed border-gray-300">
                        <FileText size={40} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 font-bold">No resume uploaded yet.</p>
                      </div>
                    )}
                  </div>`;

content = content.replace(target1, replacement1);

const target2 = `                  <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
                    <button type="submit" className="px-12 py-3.5 bg-[#22b3c1] text-white rounded-[23px] font-bold text-lg hover:bg-[#1d97a3] transition-colors shadow-md hover:shadow-lg">
                      Save Changes
                    </button>
                    <button type="button" onClick={() => setIsEditingProfile(false)} className="px-12 py-3.5 bg-white text-[#2a2a2a] rounded-[23px] font-bold text-lg hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
              <div className="mt-12 pt-10 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-[#172b4d] flex items-center gap-2"><GraduationCap className="text-[#22b3c1]" /> My Certificates</h3>
                    <p className="text-sm text-gray-500 mt-1">Upload and AI-scan your certificates to highlight your qualifications.</p>
                  </div>
                  <label className="px-6 py-3 bg-[#22b3c1] text-white rounded-[23px] font-bold text-sm shadow-md hover:bg-[#1d97a3] cursor-pointer transition-colors flex items-center gap-2">
                    {isUploadingCert ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                    {isUploadingCert ? 'Scanning...' : 'Upload & Scan'}
                    <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleCertificateUpload} disabled={isUploadingCert} />
                  </label>
                </div>

                {certificates.length === 0 ? (
                  <div className="bg-gray-50 rounded-[23px] p-8 text-center border border-dashed border-gray-300">
                    <FileCheck size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-bold">No certificates uploaded yet.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {certificates.map(cert => (
                      <div key={cert.id} className="bg-white rounded-[23px] border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow relative group">
                        <button onClick={() => handleDeleteCertificate(cert.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 p-2 rounded-full">
                          <Trash2 size={16} />
                        </button>
                        <h4 className="font-bold text-lg text-[#2a2a2a] mb-1 pr-10">{cert.title || 'Untitled Certificate'}</h4>
                        <p className="text-sm text-gray-500 font-medium mb-4">{cert.issuer || 'Unknown Issuer'} {cert.issue_date ? \`• \${cert.issue_date}\` : ''}</p>
                        
                        {cert.skills_extracted && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {cert.skills_extracted.split(',').map((s: string, idx: number) => {
                              if (!s.trim()) return null;
                              return <span key={idx} className="px-2 py-1 bg-[#22b3c1]/10 text-[#22b3c1] text-[10px] font-bold rounded-sm border border-[#22b3c1]/20 uppercase tracking-wider">{s.trim()}</span>;
                            })}
                          </div>
                        )}
                        
                        <a href={cert.file_url.startsWith('http') ? cert.file_url : \`http://localhost:5000\${cert.file_url}\`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-[#22b3c1] hover:text-[#1d97a3] transition-colors">
                          <FileText size={16} /> View Original Document
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>`;

const replacement2 = `                  {/* My Certificates Section */}
                  <div className="mt-12 pt-10 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                      <div>
                        <h3 className="text-2xl font-bold text-[#172b4d] flex items-center gap-2"><GraduationCap className="text-[#22b3c1]" /> My Certificates</h3>
                        <p className="text-sm text-gray-500 mt-1">Upload and AI-scan your certificates to highlight your qualifications.</p>
                      </div>
                      <label className="px-6 py-3 bg-[#22b3c1] text-white rounded-[23px] font-bold text-sm shadow-md hover:bg-[#1d97a3] cursor-pointer transition-colors flex items-center gap-2">
                        {isUploadingCert ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                        {isUploadingCert ? 'Scanning...' : 'Upload & Scan'}
                        <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleCertificateUpload} disabled={isUploadingCert} />
                      </label>
                    </div>

                    {certificates.length === 0 ? (
                      <div className="bg-gray-50 rounded-[23px] p-8 text-center border border-dashed border-gray-300">
                        <FileCheck size={40} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 font-bold">No certificates uploaded yet.</p>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-6">
                        {certificates.map(cert => (
                          <div key={cert.id} className="bg-white rounded-[23px] border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow relative group">
                            <button type="button" onClick={() => handleDeleteCertificate(cert.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 p-2 rounded-full">
                              <Trash2 size={16} />
                            </button>
                            <h4 className="font-bold text-lg text-[#2a2a2a] mb-1 pr-10">{cert.title || 'Untitled Certificate'}</h4>
                            <p className="text-sm text-gray-500 font-medium mb-4">{cert.issuer || 'Unknown Issuer'} {cert.issue_date ? \`• \${cert.issue_date}\` : ''}</p>
                            
                            {cert.skills_extracted && (
                              <div className="flex flex-wrap gap-2 mb-6">
                                {cert.skills_extracted.split(',').map((s: string, idx: number) => {
                                  if (!s.trim()) return null;
                                  return <span key={idx} className="px-2 py-1 bg-[#22b3c1]/10 text-[#22b3c1] text-[10px] font-bold rounded-sm border border-[#22b3c1]/20 uppercase tracking-wider">{s.trim()}</span>;
                                })}
                              </div>
                            )}
                            
                            <a href={cert.file_url.startsWith('http') ? cert.file_url : \`http://localhost:5000\${cert.file_url}\`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-[#22b3c1] hover:text-[#1d97a3] transition-colors">
                              <FileText size={16} /> View Original Document
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center gap-4 pt-12 pb-8 border-t border-gray-200 mt-12">
                    <button type="submit" className="px-12 py-3.5 bg-[#22b3c1] text-white rounded-[23px] font-bold text-lg hover:bg-[#1d97a3] transition-colors shadow-md hover:shadow-lg">
                      Save Changes
                    </button>
                    <button type="button" onClick={() => setIsEditingProfile(false)} className="px-12 py-3.5 bg-white text-[#2a2a2a] rounded-[23px] font-bold text-lg hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
`;

content = content.replace(target2, replacement2);
fs.writeFileSync('src/pages/SeekerDashboard.tsx', content);
