<template>
  <div class="section">
    <h2>Directiva</h2>
    <p class="description">Gestión de los miembros de la directiva</p>

    <div class="add-button">
      <button @click="showForm = !showForm" class="btn-add">
        {{ showForm ? '✕ Cancelar' : '+ Agregar Miembro' }}
      </button>
    </div>

    <form v-if="showForm" @submit.prevent="addMember" class="form">
      <div class="form-group">
        <label>Nombre</label>
        <input v-model="newMember.name" type="text" required />
      </div>
      <div class="form-group">
        <label>Cargo</label>
        <input v-model="newMember.position" type="text" placeholder="Ej: Presidente, Tesorero" required />
      </div>
      <div class="form-group">
        <label>Teléfono</label>
        <input v-model="newMember.phone" type="tel" />
      </div>
      <button type="submit" class="btn-save">Guardar</button>
    </form>

    <div class="members-grid">
      <div v-if="members.length === 0" class="empty-state">
        <p>No hay miembros registrados aún</p>
      </div>
      <div v-for="(member, index) in members" :key="index" class="member-card">
        <div class="member-header">
          <h3>{{ member.name }}</h3>
          <button @click="deleteMember(index)" class="btn-delete">✕</button>
        </div>
        <p class="position">{{ member.position }}</p>
        <p class="phone" v-if="member.phone">📞 {{ member.phone }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showForm = ref(false)
const members = ref([])
const newMember = ref({ name: '', position: '', phone: '' })

const loadMembers = () => {
  const data = localStorage.getItem('directiva')
  if (data) {
    members.value = JSON.parse(data)
  }
}

const addMember = () => {
  members.value.push({ ...newMember.value })
  localStorage.setItem('directiva', JSON.stringify(members.value))
  newMember.value = { name: '', position: '', phone: '' }
  showForm.value = false
}

const deleteMember = (index) => {
  members.value.splice(index, 1)
  localStorage.setItem('directiva', JSON.stringify(members.value))
}

onMounted(loadMembers)
</script>

<style scoped>
.section {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

h2 {
  color: #0052CC;
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
}

.description {
  color: #999;
  margin-bottom: 2rem;
}

.add-button {
  margin-bottom: 2rem;
}

.btn-add {
  padding: 0.8rem 1.5rem;
  background: linear-gradient(135deg, #0052CC 0%, #7F3FA8 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.form {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border-left: 4px solid #0052CC;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #0052CC;
}

.btn-save {
  padding: 0.8rem 1.5rem;
  background: #003d99;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-save:hover {
  background: #1b5e20;
  transform: translateY(-2px);
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  color: #999;
}

.member-card {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #0052CC;
  transition: all 0.3s ease;
}

.member-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
}

.member-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.5rem;
}

.member-card h3 {
  color: #333;
  margin: 0;
}

.btn-delete {
  background: #c62828;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-delete:hover {
  background: #8e0000;
}

.position {
  color: #0052CC;
  font-weight: 600;
  margin: 0.5rem 0;
}

.phone {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}
</style>
