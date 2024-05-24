import React from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { DataGrid } from '@mui/x-data-grid'
import myfetch from '../../lib/myfetch'
import IconButton from '@mui/material/IconButton'
import { Link } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import AddBoxIcon from '@mui/icons-material/AddBox'
//import Waiting from '../../ui/Waiting'
import useConfirmDialog from '../../ui/useConfirmDialog'
import useNotification from '../../ui/useNotification'
import useWaiting from '../../ui/useWaiting'

export default function CarList() {

  const columns = [
    {
      field: 'id',
      headerName: 'Cód.',
      width: 70,
      type: "number"
    },
    {
      field: 'brand',
      headerName: 'Marca/Modelo',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography>
            {params.row.brand} {params.row.model}
          </Typography>
        </Box>
      )
    },
    {
      field: 'color',
      headerName: 'Cor',
      width: 100,
    },
    {
      field: 'year_manufacture',
      headerName: 'Ano de fabricação',
      width: 160
    },
    {
      field: 'imported',
      headerName: 'Importado',
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography>
            {params.row.imported === '1' ? 'Sim': ''}
          </Typography>
        </Box>
      )
    },
    {
      field: 'plates',
      headerName: 'Placas',
      width: 150
    },
    {
      field: 'selling_price',
      headerName: 'Preço de venda',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography>
            {parseFloat(params.row.selling_price).toLocaleString('pt-br', {style: 'currency', currency: 'BRL'})}
          </Typography>
        </Box>
      )
    },
    {
      field: '_edit',
      headerName: 'Editar',
      headerAlign: 'center',
      align: 'center',
      width: 90,
      sortable: false,
      renderCell: params => (
        <Link to={'./' + params.id}>
          <IconButton aria-label="Editar">
            <EditIcon />
          </IconButton>
        </Link>
      )
    },
    {
      field: '_delete',
      headerName: 'Excluir',
      headerAlign: 'center',
      align: 'center',
      width: 90,
      sortable: false,
      renderCell: params => (
        <IconButton aria-label="Excluir" onClick={() => handleDeleteButtonClick(params.id)}>
          <DeleteForeverIcon color="error" />
        </IconButton>
      )
    },
  ]

  const [state, setState] = React.useState({
    cars: []
  })
  const {
    cars: customers
  } = state

  const { askForConfirmation, ConfirmDialog } = useConfirmDialog()
  const { notify, Notification } = useNotification()
  const { showWaiting, Waiting } = useWaiting()

  /*
    useEffect() com vetor de dependências vazio, para ser executado
    uma única vez durante o carregamento inicial do componente e
    disparar uma requisição ao back-end solicitando os dados a serem
    exibidos
  */
  React.useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    // Exibe a tela de espera
    showWaiting()
    try {
      const result = await myfetch.get('/cars?by=id')
      
      // Coloca o resultado no vetor customers
      setState({ ...state, cars: result })
    }
    catch(error) {
      console.error(error)
      notify('ERRO: ' + error.message, 'error')
    }
    finally {
      // Oculta a tela de espera
      showWaiting(false)
    }
  }

  async function handleDeleteButtonClick(deleteId) {
    if(await askForConfirmation('Deseja realmente excluir este item?', 'Confirmar operação')) {
      showWaiting()   // Exibe a tela de espera
      try {
        // Efetua uma chamada ao back-end para tentar excluir o item
        await myfetch.delete(`/cars/${deleteId}`)

        // Recarrega os dados da grid
        fetchData()

        notify('Item excluído com sucesso.')
      }
      catch(error) {
        console.error(error)
        notify('ERRO: ' + error.message, 'error')
      }
      finally {
        showWaiting(false)  // Ocultar a tela de espera
      }
    }
  }

  return(
    <>
      <Waiting />

      <Notification />

      <ConfirmDialog />

      <Typography variant="h1" gutterBottom>
        Listagem de carros
      </Typography>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'right',
          mb: 2     // Margem inferior
        }}
      >
        <Link to="./new">
          <Button
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<AddBoxIcon />}
          >
            Novo cliente
          </Button>
        </Link>
      </Box>

      <Paper elevation={10}>
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={customers}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            pageSizeOptions={[5]}
          />
        </Box>
      </Paper>     
    </>
  )
}