import { useState } from 'react';
import { ethers } from 'ethers';
import abi from './abi.json';
import './App.css';

const App = () => {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [validAccount, setValidAccount] = useState(false)
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adminName, setAdminName] = useState('');


  const contractAddress = "0x73960c2c58162975B16b83b700160ca4E6216b7A"; 

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, abi, signer);
        
        setContract(contractInstance);
        setAccount(accounts[0]);
        setValidAccount(true)
        fetchStudents();
      } else {
        alert("Please install MetaMask!");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const count = await contract.studentCount();
      const fetchedStudents = [];
      
      for (let i = 0; i < count; i++) {
        const student = await contract.students(i);
        if (student.isRegistered) {
          fetchedStudents.push({
            id: student.id.toString(),
            name: student.name,
          });
        }
      }
      
      setStudents(fetchedStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkAdmin = async () => {
    try {
      const admin = await contract.admin();
      if (account == admin.toLowerCase()) {
        setAdminName(admin);
        console.log('Admin');
        console.log('Admined:', admin);
        console.log('Account:', account);
      } else {
        console.log('you are not the admin');
        console.log('Admin:', admin);
        console.log('Account:', account);
      }
    } catch (error) {
      console.error("Error checking admin:", error);
    }
  }

  const registerStudent = async (e) => {
    e.preventDefault();
    try {
      const admin = await contract.admin();
      if (account === admin.toLowerCase()) {
        setLoading(true);
        const tx = await contract.registerStudent(studentId, studentName);
        await tx.wait();
        alert("Student registered successfully!");
        fetchStudents();
        setStudentId('');
        setStudentName('');        
      } else {
        console.log('You cannot register a student, You are not an admin');
        alert("You cannot register a student, You are not an admin")
      }
    } catch (error) {
      console.error("Error registering student:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (id) => {
    try {
      const admin = await contract.admin();
      if (account === admin.toLowerCase()) {
        setLoading(true);
        const tx = await contract.deleteStudent(id);
        await tx.wait();
        alert("Student deleted successfully!");
        fetchStudents();
      } else {
        console.log('You cannot register a student, You are not an admin');
        alert("You cannot register a student, You are not an admin")
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Error deleting student!");
    } finally {
      setLoading(false);
    }
  }; 

  const studentIds = async (id) => {
    try {
      setLoading(true);
      const tx = await contract.studentId(id);
      await tx.wait();
      alert("Student ID successfully!");
      fetchStudents();
    } catch (error) {
      console.error("Error fetching student ID:", error);
      alert("Error fetching student ID!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      {!validAccount ? <button onClick={connectWallet} className='contain'>Connect Wallet</button> : ''}
      
      <header>
        <h1>Student Registration DApp</h1>
        <p className="wallet-info">
          Connected Account: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not Connected'}
        </p>
        <button onClick={checkAdmin} className='contain'>Check admin</button>
        <p>{adminName}</p>
      </header>

      <main>
        <form onSubmit={registerStudent} className="registration-form">
          <h2>Register New Student</h2>
          <div className="form-group">
            <input
              type="number"
              placeholder="Student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Student Name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Register Student'}
          </button>
        </form>

        <div className="students-list">
          <h2>Registered Students</h2>
          {loading ? (
            <p>Loading...</p>
          ) : students.length > 0 ? (
            <ul>
              {students.map((student) => (
                <li key={student.id}>
                  <span>ID: {student.id}</span>
                  <span>Name: {student.name}</span>
                  <button
                    onClick={() => deleteStudent(student.id)}
                    className="delete-btn"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No students registered yet.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;