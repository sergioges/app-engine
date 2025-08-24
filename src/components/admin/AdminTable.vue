<script setup>
  import { ref, watch } from 'vue'

  import { useReservationStore } from '@store/reservationStore'

  import { useI18n } from 'vue-i18n'

  import moment from 'moment'
  import 'moment/dist/locale/es'

  const reservationStore = useReservationStore()
  const { reservations } = reservationStore

  const { t, locale } = useI18n()

  moment.locale(locale.value)

  const search = ref('')
  const headers = ref([
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
      title: t('adminForm.label.creation')
    },
    {
      align: 'center',
      sortable: true,
      key: 'name',
      title: t('common.label.name')
    },
    {
      align: 'center',
      sortable: false,
      key: 'phone',
      title: t('common.label.phone')
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
      title: t('adminTable.label.booking')
    },
    {
      align: 'center',
      sortable: false,
      key: 'totalNights',
      title: t('adminTable.label.nights')
    },
    {
      align: 'center',
      sortable: false,
      key: 'hosts',
      title: t('adminTable.label.hosts')
    },
    {
      align: 'center',
      sortable: false,
      key: 'pets',
      title: t('adminForm.label.pets'),
      hidden: true
    },
    {
      align: 'center',
      sortable: false,
      key: 'aquisition',
      title: t('adminForm.label.aquisition')
    },
    {
      align: 'center',
      sortable: true,
      key: 'status',
      title: t('adminForm.label.status')
    },
    {
      align: 'center',
      sortable: false,
      key: 'hostNotes',
      title: t('adminForm.label.hostNotes'),
      hidden: true
    }
  ])

  const showEditForm = defineModel('showEditForm')
  const emit = defineEmits(['fetchReservation'])

  async function fetchSelectedReservation(id) {
    showEditForm.value = true
    emit('fetchReservation', id)

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
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
    const csvHeaders = headers.value.map(header => header.title).join(',')
    const csvRows = reservations.map(row =>
      [
        row.id,
        row.createdAt,
        row.name,
        row.phone,
        row.email,
        row.dates && row.dates.length
          ? `${moment(row.dates[0]).format(t('common.label.simplifyFormatDate'))}-${moment(row.dates[row.dates.length - 1]).format(t('common.label.simplifyFormatDate'))}`
          : '',
        row.totalNights,
        row.hosts,
        row.pets,
        row.aquisition,
        row.status,
        row.hostNotes
      ]
        .map(val => `"${val ?? ''}"`)
        .join(',')
    )
    const csvContent = [csvHeaders, ...csvRows].join('\n')
    // Download and convert to csv file.
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute(
      'download',
      `${t('adminTable.label.downloadedFileName')}${moment().format(t('common.label.formatDate'))}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  watch(locale, newLocale => {
    moment.locale(newLocale)
    headers.value = headers.value.map(header => {
      switch (header.key) {
        case 'createdAt':
          return { ...header, title: t('adminForm.label.creation') }
        case 'name':
          return { ...header, title: t('common.label.name') }
        case 'phone':
          return { ...header, title: t('common.label.phone') }
        case 'email':
          return { ...header, title: 'Email' }
        case 'dates':
          return { ...header, title: t('adminTable.label.booking') }
        case 'totalNights':
          return { ...header, title: t('adminTable.label.nights') }
        case 'hosts':
          return { ...header, title: t('adminTable.label.hosts') }
        case 'pets':
          return { ...header, title: t('adminForm.label.pets') }
        case 'aquisition':
          return { ...header, title: t('adminForm.label.aquisition') }
        case 'status':
          return { ...header, title: t('adminForm.label.status') }
        case 'hostNotes':
          return { ...header, title: t('adminForm.label.hostNotes') }
        default:
          return header
      }
    })
  })

  function clearSearch() {
    search.value = ''
  }
</script>

<template>
  <v-container class="data-table">
    <v-row>
      <v-col>
        <v-data-table
          :headers="headers.filter(h => !h.hidden)"
          :items="reservations"
          :items-per-page="10"
          :page="1"
          :search="search"
          class="elevation-1"
        >
          <template v-slot:top>
            <v-toolbar>
              <v-toolbar-title class="text-left">
                {{ $t('adminTable.label.bookings') }}
              </v-toolbar-title>
              <v-spacer />
              <v-text-field
                v-model="search"
                class="search-box"
                :label="$t('adminTable.label.search')"
                color="info"
                prepend-inner-icon="mdi-magnify"
                clear-icon="mdi-close-circle-outline"
                hide-details
                single-line
                clearable
                variant="underlined"
                @click:clear="clearSearch"
              ></v-text-field>
              <v-spacer />
              <v-btn color="success" elevation="2" class="mr-4" @click="downloadCSV">
                {{ $t('adminTable.label.dowload') }}
              </v-btn>
            </v-toolbar>
          </template>
          <template v-slot:item.id="{ item }">
            <v-btn color="primary" @click="fetchSelectedReservation(item.id)">
              {{ $t('adminTable.label.edit') }}
            </v-btn>
          </template>
          <template v-slot:item.dates="{ item }">
            <p>
              {{ moment(item.dates[0]).format($t('common.label.simplifyFormatDate')) }}
              -
              {{
                moment(item.dates[item.dates.length - 1]).format(
                  $t('common.label.simplifyFormatDate')
                )
              }}
            </p>
          </template>
          <template v-slot:item.aquisition="{ item }">
            <v-chip v-if="item.aquisition" color="info" text-color="white">
              {{ item.aquisition }}
            </v-chip>
            <v-chip v-else color="grey" text-color="white">-</v-chip>
          </template>
          <template v-slot:item.status="{ item }">
            <v-chip :color="setStatusColor(item.status)" text-color="white">
              {{ item.status }}
            </v-chip>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="css" scoped>
  .data-table {
    max-width: max-content;
  }

  .search-box {
    width: 300px;
  }
</style>
