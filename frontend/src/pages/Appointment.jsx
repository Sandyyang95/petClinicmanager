import { useState, useEffect } from "react";
import axiosInstance from '../axiosConfig';

const APPOINTMENTS_PATH = "/api/appointments";
const PETS_PATH = "/api/pets";

export default function Appointment() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [pets, setPets] = useState([]);

  const [form, setForm] = useState({
    petId: "",
    date: "",
    time: "",
    reason: "",
    appointmentType: "Treatment",
    status: "Scheduled",
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(form);

  // loading list
  async function load() {
    setLoading(true); setErr("");
    try {
      const response = await axiosInstance.get(APPOINTMENTS_PATH);
      setList(response.data);
    } catch (e) {
      setErr(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  // Load pets list
  async function loadPets() {
    try {
      const response = await axiosInstance.get(PETS_PATH);
      setPets(response.data);
    } catch (e) {
      setErr(e.response?.data?.message || e.message);
    }
  }

  useEffect(() => { 
    load(); 
    loadPets();
  }, []);

  function onChange(e, setter) {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: value }));
  }

  // add
  async function createAppointment(e) {
    e.preventDefault();
    try {
      // Combine date and time into a single ISO date string
      const combinedDate = new Date(`${form.date}T${form.time}`);
      
      // Create the appointment payload
      const appointmentData = {
        petId: form.petId,
        date: combinedDate.toISOString(),
        reason: form.reason,
        appointmentType: form.appointmentType,
        status: form.status
      };
      
      await axiosInstance.post(APPOINTMENTS_PATH, appointmentData);
      setForm({ petId: "", date: "", time: "", reason: "", appointmentType: "Treatment", status: "Scheduled" });
      await load();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  }

  // renew
  async function saveEdit(id) {
    try {
      // Combine date and time into a single ISO date string
      const combinedDate = new Date(`${editForm.date}T${editForm.time}`);
      
      // Create the appointment payload
      const appointmentData = {
        petId: editForm.petId,
        date: combinedDate.toISOString(),
        reason: editForm.reason,
        appointmentType: editForm.appointmentType,
        status: editForm.status
      };
      
      await axiosInstance.put(`${APPOINTMENTS_PATH}/${id}`, appointmentData);
      setEditingId(null);
      await load();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  }

  // delete

  // eslint-disable-next-line no-restricted-globals
  async function remove(id) {
    if (!window.confirm("Delete this appointment?")) return;
    try {
      await axiosInstance.delete(`${APPOINTMENTS_PATH}/${id}`);
      await load();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Appointments</h1>
      {err && <div className="text-red-600 mb-3">{err}</div>}

      {/* add list */}
      <form onSubmit={createAppointment} className="grid grid-cols-2 gap-3 mb-6">
        <select className="border p-2 rounded" name="petId" 
          value={form.petId} onChange={(e)=>onChange(e, setForm)} required>
          <option value="">-- Select Pet --</option>
          {pets.map(pet => (
            <option key={pet._id} value={pet._id}>{pet.name} ({pet.species})</option>
          ))}
        </select>
        <input 
          className="border p-2 rounded" 
          type="date" 
          name="date" 
          min={new Date().toISOString().split('T')[0]} 
          value={form.date} 
          onChange={(e)=>onChange(e, setForm)} 
          required 
        />
        <select
          className="border p-2 rounded"
          name="time"
          value={form.time}
          onChange={(e) => onChange(e, setForm)}
          required
        >
          <option value="">-- Select Time --</option>
          {/* Generate time options from 00:00 to 23:45 in 15-minute increments */}
          {(() => {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const isToday = form.date === now.toISOString().split('T')[0];
            
            // Generate all time slots
            const timeSlots = [];
            
            // Calculate next available time slot for today
            let startHour = 0;
            let startMinuteIndex = 0; // 0=00, 1=15, 2=30, 3=45
            
            if (isToday) {
              startHour = currentHour;
              
              // Find the next 15-minute interval
              if (currentMinute < 15) {
                startMinuteIndex = 1; // :15
              } else if (currentMinute < 30) {
                startMinuteIndex = 2; // :30
              } else if (currentMinute < 45) {
                startMinuteIndex = 3; // :45
              } else {
                // After :45, move to next hour
                startHour += 1;
                startMinuteIndex = 0; // :00 of next hour
              }
            }
            
            // Generate available time slots
            for (let hour = 0; hour < 24; hour++) {
              // Skip hours before start hour
              if (isToday && hour < startHour) continue;
              
              for (let i = 0; i < 4; i++) { // 0=00, 1=15, 2=30, 3=45
                // Skip minutes before start minute for the first hour
                if (isToday && hour === startHour && i < startMinuteIndex) continue;
                
                const minute = i * 15;
                const formattedHour = hour.toString().padStart(2, '0');
                const formattedMinute = minute.toString().padStart(2, '0');
                timeSlots.push(`${formattedHour}:${formattedMinute}`);
              }
            }
            
            return timeSlots.map(time => (
              <option key={time} value={time}>{time}</option>
            ));
          })()}
        </select>
        <select className="border p-2 rounded" name="appointmentType"
          value={form.appointmentType} onChange={(e)=>onChange(e, setForm)} required>
          <option value="Treatment">Treatment</option>
          <option value="Vaccination">Vaccination</option>
        </select>
        <select className="border p-2 rounded" name="status"
          value={form.status} onChange={(e)=>onChange(e, setForm)} required>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <textarea className="border p-2 rounded col-span-2" name="reason" placeholder="Reason"
          value={form.reason} onChange={(e)=>onChange(e, setForm)} />
        <button className="col-span-2 bg-blue-600 text-white rounded px-4 py-2">Add Appointment</button>
      </form>

      {/* list */}
      {loading ? <p>Loading...</p> : (
        <ul className="space-y-3">
          {list.map(a => (
            <li key={a._id} className="border rounded p-3 flex items-start justify-between">
              <div className="w-full">
                {editingId === a._id ? (
                  <div className="grid grid-cols-2 gap-3">
                    <select className="border p-2 rounded" name="petId" value={editForm.petId} onChange={(e)=>onChange(e, setEditForm)} required>
                      {pets.map(pet => (
                        <option key={pet._id} value={pet._id}>{pet.name} ({pet.species})</option>
                      ))}
                    </select>
                    <input 
                      className="border p-2 rounded" 
                      type="date" 
                      name="date" 
                      min={new Date().toISOString().split('T')[0]}
                      value={editForm.date} 
                      onChange={(e)=>onChange(e, setEditForm)} 
                    />
                    <select
                      className="border p-2 rounded"
                      name="time"
                      value={editForm.time}
                      onChange={(e) => onChange(e, setEditForm)}
                      required
                    >
                      <option value="">-- Select Time --</option>
                      {/* Generate time options from 00:00 to 23:45 in 15-minute increments */}
                      {(() => {
                        const now = new Date();
                        const currentHour = now.getHours();
                        const currentMinute = now.getMinutes();
                        const isToday = editForm.date === now.toISOString().split('T')[0];
                        
                        // Generate all time slots
                        const timeSlots = [];
                        
                        // Calculate next available time slot for today
                        let startHour = 0;
                        let startMinuteIndex = 0; // 0=00, 1=15, 2=30, 3=45
                        
                        if (isToday) {
                          startHour = currentHour;
                          
                          // Find the next 15-minute interval
                          if (currentMinute < 15) {
                            startMinuteIndex = 1; // :15
                          } else if (currentMinute < 30) {
                            startMinuteIndex = 2; // :30
                          } else if (currentMinute < 45) {
                            startMinuteIndex = 3; // :45
                          } else {
                            // After :45, move to next hour
                            startHour += 1;
                            startMinuteIndex = 0; // :00 of next hour
                          }
                        }
                        
                        // Generate available time slots
                        for (let hour = 0; hour < 24; hour++) {
                          // Skip hours before start hour
                          if (isToday && hour < startHour) continue;
                          
                          for (let i = 0; i < 4; i++) { // 0=00, 1=15, 2=30, 3=45
                            // Skip minutes before start minute for the first hour
                            if (isToday && hour === startHour && i < startMinuteIndex) continue;
                            
                            const minute = i * 15;
                            const formattedHour = hour.toString().padStart(2, '0');
                            const formattedMinute = minute.toString().padStart(2, '0');
                            timeSlots.push(`${formattedHour}:${formattedMinute}`);
                          }
                        }
                        
                        return timeSlots.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ));
                      })()}
                    </select>
                    <select className="border p-2 rounded" name="appointmentType" value={editForm.appointmentType} onChange={(e)=>onChange(e, setEditForm)}>
                      <option value="Treatment">Treatment</option>
                      <option value="Vaccination">Vaccination</option>
                    </select>
                    <select className="border p-2 rounded" name="status" value={editForm.status} onChange={(e)=>onChange(e, setEditForm)}>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <textarea className="border p-2 rounded col-span-2" name="reason" value={editForm.reason} onChange={(e)=>onChange(e, setEditForm)} />
                    <div className="col-span-2 flex gap-2">
                      <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={()=>saveEdit(a._id)}>Save</button>
                      <button className="bg-gray-300 px-3 py-1 rounded" onClick={()=>setEditingId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="font-semibold">
                      {/* Display pet name from populated petId object if available */}
                      {a.petId && typeof a.petId === 'object' ? a.petId.name : 'Pet'} - 
                      {/* Format date nicely */}
                      {new Date(a.date).toLocaleDateString()} {new Date(a.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div className="text-sm mt-1">
                      <span className="font-medium">Type: {a.appointmentType}</span>
                      <span className="ml-2 px-2 py-0.5 rounded text-xs" 
                        style={{
                          backgroundColor: a.status === 'Completed' ? '#10b981' : 
                                           a.status === 'Cancelled' ? '#ef4444' : '#3b82f6',
                          color: 'white'
                        }}>
                        {a.status}
                      </span>
                      {a.reason && <div>Reason: {a.reason}</div>}
                    </div>
                  </>
                )}
              </div>
              {editingId !== a._id && (
                <div className="ml-4 shrink-0 space-x-2">
                  <button className="px-3 py-1 rounded bg-gray-200" onClick={() => { 
                    // Format date from ISO string to YYYY-MM-DD for input
                    const appointmentDate = a.date ? new Date(a.date) : new Date();
                    const formattedDate = appointmentDate.toISOString().split('T')[0];
                    
                    // Format time from ISO string to HH:MM for input
                    const formattedTime = appointmentDate.toTimeString().split(' ')[0].substr(0, 5);
                    
                    setEditingId(a._id); 
                    setEditForm({ 
                      petId: a.petId?._id || a.petId, 
                      date: formattedDate, 
                      time: formattedTime, 
                      reason: a.reason || "", 
                      appointmentType: a.appointmentType,
                      status: a.status || "Scheduled" 
                    }); 
                  }}>
                    Edit
                  </button>
                  <button className="px-3 py-1 rounded bg-red-500 text-white" onClick={()=>remove(a._id)}>
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
