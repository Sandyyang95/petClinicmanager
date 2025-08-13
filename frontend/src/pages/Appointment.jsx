import { useState, useEffect } from "react";


const API_URL = "http://16.176.16.94:5001";
const APPOINTMENTS_PATH = "/api/appointments";

function getToken() {
  return localStorage.getItem("token");
}

async function api(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    let msg = await res.text();
    try { const j = JSON.parse(msg); msg = j.message || msg; } catch {}
    throw new Error(msg || res.statusText);
  }
  return res.json();
}

export default function Appointment() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    petName: "",
    date: "",
    time: "",
    reason: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(form);

  // loading list
  async function load() {
    setLoading(true); setErr("");
    try {
      const data = await api(APPOINTMENTS_PATH);
      setList(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function onChange(e, setter) {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: value }));
  }

  // 新增
  async function createAppointment(e) {
    e.preventDefault();
    try {
      await api(APPOINTMENTS_PATH, { method: "POST", body: form });
      setForm({ petName: "", date: "", time: "", reason: "" });
      await load();
    } catch (e) {
      alert(e.message);
    }
  }

  // 更新
  async function saveEdit(id) {
    try {
      await api(`${APPOINTMENTS_PATH}/${id}`, { method: "PUT", body: editForm });
      setEditingId(null);
      await load();
    } catch (e) {
      alert(e.message);
    }
  }

  // 刪除
  async function remove(id) {
    if (!confirm("Delete this appointment?")) return;
    try {
      await api(`${APPOINTMENTS_PATH}/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Appointments</h1>
      {err && <div className="text-red-600 mb-3">{err}</div>}

      {/* add list */}
      <form onSubmit={createAppointment} className="grid grid-cols-2 gap-3 mb-6">
        <input className="border p-2 rounded" name="petName" placeholder="Pet Name"
          value={form.petName} onChange={(e)=>onChange(e, setForm)} required />
        <input className="border p-2 rounded" type="date" name="date"
          value={form.date} onChange={(e)=>onChange(e, setForm)} required />
        <input className="border p-2 rounded" type="time" name="time"
          value={form.time} onChange={(e)=>onChange(e, setForm)} required />
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
                    <input className="border p-2 rounded" name="petName" value={editForm.petName} onChange={(e)=>onChange(e, setEditForm)} />
                    <input className="border p-2 rounded" type="date" name="date" value={editForm.date} onChange={(e)=>onChange(e, setEditForm)} />
                    <input className="border p-2 rounded" type="time" name="time" value={editForm.time} onChange={(e)=>onChange(e, setEditForm)} />
                    <textarea className="border p-2 rounded col-span-2" name="reason" value={editForm.reason} onChange={(e)=>onChange(e, setEditForm)} />
                    <div className="col-span-2 flex gap-2">
                      <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={()=>saveEdit(a._id)}>Save</button>
                      <button className="bg-gray-300 px-3 py-1 rounded" onClick={()=>setEditingId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="font-semibold">{a.petName} - {a.date} {a.time}</div>
                    {a.reason && <div className="text-sm mt-1">Reason: {a.reason}</div>}
                  </>
                )}
              </div>
              {editingId !== a._id && (
                <div className="ml-4 shrink-0 space-x-2">
                  <button className="px-3 py-1 rounded bg-gray-200" onClick={() => { setEditingId(a._id); setEditForm({ petName: a.petName, date: a.date, time: a.time, reason: a.reason || "" }); }}>
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
