import { useEffect, useState } from "react";
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const PETS_PATH = "/api/pets";

export default function PetProfile() {
  const { user } = useAuth();

  
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ name: "", species: "dog", breed: "", age: 0, medicalHistory: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(form);

  async function load() {
    setLoading(true); setErr("");
    try {
      const response = await axiosInstance.get(PETS_PATH);
      setList(response.data);
    } catch (e) {
      setErr(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if(user) load(); }, [user]);

  function onChange(e, setter) {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: name === "age" ? Number(value) : value }));
  }

  async function createPet(e) {
    e.preventDefault();
    try {
      await axiosInstance.post(PETS_PATH, form);
      setForm({ name: "", species: "dog", breed: "", age: 0, medicalHistory: "" });
      await load();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  }

  async function saveEdit(id) {
    try {
      await axiosInstance.put(`${PETS_PATH}/${id}`, editForm);
      setEditingId(null);
      await load();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  }

  async function remove(id) {
    if (window.confirm("Delete this pet?")) {
      try {
        await axiosInstance.delete(`${PETS_PATH}/${id}`);
        await load();
      } catch (e) {
        alert(e.response?.data?.message || e.message);
      }
    }
  }

  if (!user) return <div className="p-6">Please login first</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Pet Profile</h1>
      {err && <div className="text-red-600 mb-3">{err}</div>}

      {/* add list */}
      <form onSubmit={createPet} className="grid grid-cols-2 gap-3 mb-6">
        <input className="border p-2 rounded" name="name" placeholder="Name"
          value={form.name} onChange={(e)=>onChange(e, setForm)} required />
        <select className="border p-2 rounded" name="species"
          value={form.species} onChange={(e)=>onChange(e, setForm)}>
          <option value="dog">Dog</option><option value="cat">Cat</option>
          <option value="bird">Bird</option><option value="reptile">Reptile</option>
          <option value="other">Other</option>
        </select>
        <input className="border p-2 rounded" name="breed" placeholder="Breed"
          value={form.breed} onChange={(e)=>onChange(e, setForm)} />
        <input className="border p-2 rounded" type="number" name="age" placeholder="Age"
          value={form.age} onChange={(e)=>onChange(e, setForm)} />
        <textarea className="border p-2 rounded col-span-2" name="medicalHistory" placeholder="Medical History"
          value={form.medicalHistory} onChange={(e)=>onChange(e, setForm)} />
        <button className="col-span-2 bg-blue-600 text-white rounded px-4 py-2">Add Pet</button>
      </form>

      {/* list */}
      {loading ? <p>Loading...</p> : (
        <ul className="space-y-3">
          {list.map(p => (
            <li key={p._id} className="border rounded p-3 flex items-start justify-between">
              <div className="w-full">
                {editingId === p._id ? (
                  <div className="grid grid-cols-2 gap-3">
                    <input className="border p-2 rounded" name="name" value={editForm.name}
                      onChange={(e)=>onChange(e, setEditForm)} />
                    <select className="border p-2 rounded" name="species" value={editForm.species}
                      onChange={(e)=>onChange(e, setEditForm)}>
                      <option value="dog">Dog</option><option value="cat">Cat</option>
                      <option value="bird">Bird</option><option value="reptile">Reptile</option>
                      <option value="other">Other</option>
                    </select>
                    <input className="border p-2 rounded" name="breed" value={editForm.breed}
                      onChange={(e)=>onChange(e, setEditForm)} />
                    <input className="border p-2 rounded" type="number" name="age" value={editForm.age}
                      onChange={(e)=>onChange(e, setEditForm)} />
                    <textarea className="border p-2 rounded col-span-2" name="medicalHistory" value={editForm.medicalHistory}
                      onChange={(e)=>onChange(e, setEditForm)} />
                    <div className="col-span-2 flex gap-2">
                      <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={()=>saveEdit(p._id)}>Save</button>
                      <button className="bg-gray-300 px-3 py-1 rounded" onClick={()=>setEditingId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="font-semibold">{p.name} <span className="opacity-70 text-sm">({p.species})</span></div>
                    <div className="text-sm opacity-75">Breed: {p.breed || '-'} | Age: {p.age ?? '-'}</div>
                    {p.medicalHistory && <div className="text-sm mt-1">Medical History: {p.medicalHistory}</div>}
                  </>
                )}
              </div>
              {editingId !== p._id && (
                <div className="ml-4 shrink-0 space-x-2">
                  <button className="px-3 py-1 rounded bg-gray-200"
                    onClick={() => { setEditingId(p._id); setEditForm({
                      name: p.name || "", species: p.species || "dog", breed: p.breed || "",
                      age: p.age ?? 0, medicalHistory: p.medicalHistory || ""
                    }); }}>
                    Edit
                  </button>
                  <button className="px-3 py-1 rounded bg-red-500 text-white" onClick={()=>remove(p._id)}>
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

// comm//