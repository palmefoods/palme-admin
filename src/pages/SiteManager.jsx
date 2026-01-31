import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Megaphone, Image as ImageIcon, MessageSquare, Video, Plus, Trash2, HelpCircle, X, Camera } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SiteManager = () => {
  const [activeTab, setActiveTab] = useState('announcement');
  
 
  const [slides, setSlides] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]); 
  const [processVideo, setProcessVideo] = useState(null);
  const [announcement, setAnnouncement] = useState({ show: true, text: '', code: '', color: 'bg-palmeGreen' });

 
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); 
  const [formData, setFormData] = useState({}); 

 
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const [slideRes, reviewRes, faqRes, vidRes, annRes, galleryRes] = await Promise.all([
        axios.get(`${API_URL}/api/content/hero_slide`),
        axios.get(`${API_URL}/api/content/testimonial`),
        axios.get(`${API_URL}/api/content/faq`),
        axios.get(`${API_URL}/api/content/process_video`),
        axios.get(`${API_URL}/api/content/announcement`),
        axios.get(`${API_URL}/api/content/gallery`)
      ]);
      setSlides(slideRes.data);
      setTestimonials(reviewRes.data);
      setFaqs(faqRes.data);
      setGalleryImages(galleryRes.data);
      if (vidRes.data.length > 0) setProcessVideo(vidRes.data[0]);
      if (annRes.data.length > 0) setAnnouncement(annRes.data[0].data);
    } catch (err) { console.error("Failed to load content"); }
  };

 
  const handleSaveAnnouncement = async () => {
    try {
      await axios.post(`${API_URL}/api/content`, { type: 'announcement', data: announcement });
      alert("Announcement Saved!");
    } catch (err) { alert("Failed"); }
  };

  const handleAddSlide = async (url) => {
    if (!url) return;
    try {
      const res = await axios.post(`${API_URL}/api/content`, { type: 'hero_slide', data: { imageUrl: url } });
      setSlides([...slides, res.data]);
      setRefreshKey(prev => prev + 1);
    } catch (err) { alert("Failed"); }
  };

  const handleAddGalleryImage = async (url) => {
    if (!url) return;
    try {
        const res = await axios.post(`${API_URL}/api/content`, { 
            type: 'gallery', 
            data: { imageUrl: url, caption: 'Farm Life' } 
        });
        setGalleryImages([...galleryImages, res.data]);
        setRefreshKey(prev => prev + 1);
    } catch (err) { alert("Failed to add image"); }
  };

  const handleUploadVideo = async (url) => {
    if (!url) return;
    try {
      if (processVideo) await axios.delete(`${API_URL}/api/content/${processVideo._id}`);
      const res = await axios.post(`${API_URL}/api/content`, { type: 'process_video', data: { videoUrl: url } });
      setProcessVideo(res.data);
    } catch (err) { alert("Failed"); }
  };

  const handleDelete = async (id, setter, list) => {
    if(!window.confirm("Delete this item?")) return;
    try {
      await axios.delete(`${API_URL}/api/content/${id}`);
      setter(list.filter(item => item._id !== id));
    } catch (err) { alert("Failed"); }
  };

  const openModal = (type) => {
    setModalType(type);
    setFormData({});
    setModalOpen(true);
  }

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/content`, { type: modalType, data: formData });
      if (modalType === 'testimonial') setTestimonials([...testimonials, res.data]);
      if (modalType === 'faq') setFaqs([...faqs, res.data]);
      setModalOpen(false);
    } catch (err) { alert("Failed"); }
  };

  const TabButton = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 pb-3 px-1 font-bold text-sm transition-all border-b-2 ${
        activeTab === id 
          ? 'border-palmeGreen text-palmeGreen' 
          : 'border-transparent text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
      }`}
    >
      <Icon size={18} /> {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Site Content & Media</h1>
      </div>
      
      
      <div className="flex space-x-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <TabButton id="announcement" icon={Megaphone} label="Announcement" />
        <TabButton id="carousel" icon={ImageIcon} label="Hero Slider" />
        <TabButton id="gallery" icon={Camera} label="Gallery" />
        <TabButton id="testimonials" icon={MessageSquare} label="Reviews" />
        <TabButton id="process" icon={Video} label="Video" />
        <TabButton id="faqs" icon={HelpCircle} label="FAQs" />
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[500px]">
        
        
        {activeTab === 'announcement' && (
          <div className="max-w-xl space-y-6 animate-fade-in-up">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">Top Notification Bar</h3>
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
               <span className="font-bold text-gray-700 dark:text-gray-200">Show Announcement Bar?</span>
               <label className="relative inline-flex items-center cursor-pointer">
                 <input type="checkbox" checked={announcement.show} onChange={e => setAnnouncement({...announcement, show: e.target.checked})} className="sr-only peer" />
                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-palmeGreen"></div>
               </label>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Announcement Text</label>
              <input className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600" value={announcement.text} onChange={e => setAnnouncement({...announcement, text: e.target.value})} placeholder="Enter text..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Discount Code</label>
                  <input className="w-full p-3 border rounded-lg font-mono text-palmeRed font-bold dark:bg-gray-700 dark:border-gray-600" value={announcement.code} onChange={e => setAnnouncement({...announcement, code: e.target.value})} />
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Background Color</label>
                  <div className="flex gap-2">
                    {['bg-palmeGreen', 'bg-palmeRed'].map(c => (
                      <div key={c} onClick={() => setAnnouncement({...announcement, color: c})} className={`w-8 h-8 rounded-full cursor-pointer ${c} ${announcement.color === c ? 'ring-2 ring-offset-2 ring-gray-400' : 'opacity-70'}`}></div>
                    ))}
                  </div>
               </div>
            </div>
            <button onClick={handleSaveAnnouncement} className="bg-palmeGreen text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-green-800 transition-colors"><Save size={18} /> Save Settings</button>
          </div>
        )}

        
        {activeTab === 'carousel' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center">
               <h3 className="font-bold text-lg text-gray-800 dark:text-white">Homepage Slider Images</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {slides.map((slide, index) => (
                 <div key={slide._id} className="relative group rounded-xl overflow-hidden shadow-sm aspect-video border border-gray-200 dark:border-gray-600">
                    <img src={slide.data.imageUrl} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 text-xs rounded">Slide {index + 1}</div>
                    <button onClick={() => handleDelete(slide._id, setSlides, slides)} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                 </div>
               ))}
               <div className="aspect-video bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center p-4">
                  
                  <ImageUpload key={refreshKey} label="Add Slide" onUploadComplete={handleAddSlide} />
               </div>
            </div>
          </div>
        )}

        
        {activeTab === 'gallery' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center">
               <h3 className="font-bold text-lg text-gray-800 dark:text-white">Farm Gallery Photos</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
               {galleryImages.map((img) => (
                 <div key={img._id} className="relative group rounded-xl overflow-hidden shadow-sm aspect-square border border-gray-200 dark:border-gray-600">
                    <img src={img.data.imageUrl} className="w-full h-full object-cover" />
                    <button onClick={() => handleDelete(img._id, setGalleryImages, galleryImages)} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                 </div>
               ))}
               <div className="aspect-square bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center p-4">
                  
                  <ImageUpload key={refreshKey} label="Add Photo" onUploadComplete={handleAddGalleryImage} />
               </div>
            </div>
          </div>
        )}

        
        {activeTab === 'testimonials' && (
          <div className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-lg text-gray-800 dark:text-white">Customer Reviews</h3>
               <button onClick={() => openModal('testimonial')} className="bg-palmeGreen text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-green-800">
                 <Plus size={16} /> Add Review
               </button>
            </div>
            <div className="space-y-3">
              {testimonials.map(t => (
                <div key={t._id} className="bg-white dark:bg-gray-700 p-4 rounded-xl border border-gray-100 dark:border-gray-600 shadow-sm flex justify-between items-start group hover:border-palmeGreen transition-colors">
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-white text-base">{t.data.author} <span className="text-gray-400 text-xs font-normal">| {t.data.role}</span></h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 italic">"{t.data.text}"</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDelete(t._id, setTestimonials, testimonials)} className="text-red-500 text-xs font-bold hover:underline">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        
        {activeTab === 'process' && (
           <div className="max-w-xl animate-fade-in-up">
              <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">"See The Process" Video</h3>
              {processVideo ? (
                <div className="relative rounded-xl overflow-hidden aspect-video bg-black mb-4 group border border-gray-200 dark:border-gray-600">
                   <video src={processVideo.data.videoUrl} controls className="w-full h-full" />
                   <button onClick={() => handleDelete(processVideo._id, () => setProcessVideo(null), [])} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18}/></button>
                </div>
              ) : (
                <div className="bg-gray-100 dark:bg-gray-700 rounded-xl aspect-video flex items-center justify-center mb-4 border border-dashed border-gray-300 dark:border-gray-600"><p className="text-gray-400 font-bold">No Video Uploaded</p></div>
              )}
              <ImageUpload label="Upload MP4 Video" onUploadComplete={handleUploadVideo} />
           </div>
        )}

        
        {activeTab === 'faqs' && (
          <div className="animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-lg text-gray-800 dark:text-white">FAQs</h3>
               <button onClick={() => openModal('faq')} className="bg-palmeGreen text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm"><Plus size={16} /> Add FAQ</button>
            </div>
            <div className="space-y-3">
               {faqs.map(faq => (
                 <div key={faq._id} className="bg-white dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm flex justify-between items-start">
                    <div>
                       <p className="font-bold text-palmeGreen dark:text-green-400 mb-1 text-sm">Q: {faq.data.question}</p>
                       <p className="text-gray-600 dark:text-gray-300 text-sm">A: {faq.data.answer}</p>
                    </div>
                    <button onClick={() => handleDelete(faq._id, setFaqs, faqs)} className="text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>
                 </div>
               ))}
            </div>
          </div>
        )}

      </div>

      
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in-up">
             <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Add {modalType === 'testimonial' ? 'Review' : 'FAQ'}</h3>
                <button onClick={() => setModalOpen(false)}><X className="text-gray-400 hover:text-red-500" /></button>
             </div>
             
             <form onSubmit={handleModalSubmit} className="space-y-4">
               {modalType === 'testimonial' ? (
                 <>
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Customer Name</label>
                     <input className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600" required onChange={e => setFormData({...formData, author: e.target.value})} />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role / Title</label>
                     <input className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="e.g. Head Chef" required onChange={e => setFormData({...formData, role: e.target.value})} />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Review</label>
                     <textarea className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 h-24" required onChange={e => setFormData({...formData, text: e.target.value})} />
                   </div>
                 </>
               ) : (
                 <>
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Question</label>
                     <input className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600" required onChange={e => setFormData({...formData, question: e.target.value})} />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Answer</label>
                     <textarea className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 h-24" required onChange={e => setFormData({...formData, answer: e.target.value})} />
                   </div>
                 </>
               )}
               <button className="w-full bg-palmeGreen text-white font-bold py-3 rounded-xl hover:bg-green-800 transition-colors">Save Item</button>
             </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SiteManager;