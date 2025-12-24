const [enrolledWorkshops, setEnrolledWorkshops] = useState([]);

useEffect(() => {
  if (auth.currentUser) {
    fetch(`http://localhost:5000/api/workshops/my-enrollments?firebaseUID=${auth.currentUser.uid}`)
      .then(res => res.json())
      .then(data => setEnrolledWorkshops(data.enrollments));
  }
}, []);

// In your JSX:
<div className="mt-10">
  <h2 className="text-2xl font-bold text-brand-gold mb-6">My Enrolled Workshops</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {enrolledWorkshops.map((item: any) => (
      <div key={item._id} className="bg-gray-800 p-4 rounded-xl border border-white/5 flex gap-4 items-center">
        <img src={item.workshop.thumbnail} className="w-20 h-20 object-cover rounded-lg" />
        <div>
          <h4 className="font-bold">{item.workshop.title}</h4>
          <p className="text-xs text-gray-400">Joined on {new Date(item.enrolledAt).toLocaleDateString()}</p>
        </div>
      </div>
    ))}
  </div>
</div>