<script setup>
  import { useReservationStore } from '@store/reservationStore'

  import moment from 'moment'
  import 'moment/dist/locale/es'

  const reservationStore = useReservationStore()
  const { reservations } = reservationStore

  moment.locale('es')

  const headers = [
    {
      align: 'center',
      sortable: false,
      key: 'id',
      title: 'ID'
    },
    {
      align: 'center',
      sortable: true,
      key: 'createdAt',
      title: 'Creación'
    },
    {
      align: 'center',
      sortable: true,
      key: 'name',
      title: 'Nombre'
    },
    {
      align: 'center',
      sortable: false,
      key: 'phone',
      title: 'Teléfono'
    },
    {
      align: 'center',
      sortable: true,
      key: 'email',
      title: 'Email'
    },
    {
      align: 'center',
      sortable: true,
      key: 'dates',
      title: 'Reserva'
    },
    {
      align: 'center',
      sortable: false,
      key: 'totalNights',
      title: 'Noches'
    },
    {
      align: 'center',
      sortable: false,
      key: 'hosts',
      title: 'Huespedes'
    },
    {
      align: 'center',
      sortable: false,
      key: 'pets',
      title: 'Mascotas'
    },
    {
      align: 'center',
      sortable: true,
      key: 'status',
      title: 'Estado'
    }
  ]

  const showEditForm = defineModel('showEditForm')
  const emit = defineEmits(['fetchReservation'])

  async function fetchSelectedReservation(id) {
    showEditForm.value = true
    emit('fetchReservation', id)
  }

  function setStatusColor(status) {
    switch (status) {
      case 'paid':
        return 'green'
      case 'pending':
        return 'orange'
      case 'cancelled':
        return 'red'
      case 'completed':
        return 'blue'
      default:
        return 'grey'
    }
  }

  function downloadCSV() {
    const csvHeaders = headers.map(header => header.title).join(',')
    const csvRows = reservations.map(row =>
      [
        row.id,
        row.createdAt,
        row.name,
        row.phone,
        row.email,
        row.dates && row.dates.length
          ? `${moment(row.dates[0]).format('DD/MM')}-${moment(row.dates[row.dates.length - 1]).format('DD/MM')}`
          : '',
        row.totalNights,
        row.hosts,
        row.pets,
        row.status
      ]
        .map(val => `"${val ?? ''}"`)
        .join(',')
    )
    const csvContent = [csvHeaders, ...csvRows].join('\n')
    // Download and convert to csv file.
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `reservas_${moment().format('DD-MM-YYYY')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
</script>

<template>
  <v-container class="data-table">
    <v-row>
      <v-col>
        <v-data-table-virtual
          :headers="headers"
          :items="reservations"
          height="400"
          class="elevation-1"
        >
          <template v-slot:top>
            <v-toolbar>
              <v-toolbar-title class="text-left">Reservas</v-toolbar-title>
              <v-spacer />
              <v-btn color="success" elevation="2" class="mr-4" @click="downloadCSV">
                Descargar CSV
              </v-btn>
            </v-toolbar>
          </template>
          <template v-slot:item.id="{ item }">
            <v-btn color="primary" @click="fetchSelectedReservation(item.id)">
              {{ item.id.slice(-5) }}
            </v-btn>
          </template>
          <template v-slot:item.dates="{ item }">
            <p>
              {{ moment(item.dates[0]).format('DD/MM') }}
              -
              {{ moment(item.dates[item.dates.length - 1]).format('DD/MM') }}
            </p>
          </template>
          <template v-slot:item.status="{ item }">
            <v-chip :color="setStatusColor(item.status)" text-color="white">
              {{ item.status }}
            </v-chip>
          </template>
        </v-data-table-virtual>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="css" scoped>
  .data-table {
    max-width: max-content;
  }
</style>
