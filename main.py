import eel
import sys
from sgbd import SGBD
from calculate import Calculate
from criterios_projeto import CriteriosProjeto


eel.init('front-end')

@eel.expose
def init():
    bd = SGBD()
    dims = [f"M{dim}" for dim in bd.all_dim_screw()]
    mats = bd.alcomprimentoParafuso_materials()
    eel.populate_select('Parafuso', dims)
    eel.populate_select('Material', mats)
    elasticity = (bd.filter_elasticy('Aço'))[0]
    eel.fill_value('elasticidadeDoParafuso', elasticity)
    onChange('elasticidadeDoParafuso', dims[0].replace('M', ''))

@eel.expose
def close():
    sys.exit(0)

@eel.expose
def onChange(id, value):
    bd=SGBD()
    if 'Parafuso' in id:
        tag = 'Passo'
        height = (bd.filter_height_nut(value))[0]
        eel.fill_value('alturaPorca', float(height))
        results = [float(p) for p in bd.filter_pitch(value)]
    if 'Material' in id:
        tag = 'elasticidadeDoParafuso'
        elasticity = (bd.filter_elasticy(value))[0]
        eel.fill_value(tag, elasticity)
        return
    if 'Classe' in id:
        limite_escoamento = (bd.filter_tensao_escoamento(value))[0]
        eel.fill_value('sesc', limite_escoamento)
        ruptura = (bd.filter_tensao_ruptura(value))[0]
        eel.fill_value('sruptura', ruptura)
        prova = (bd.filter_tensao_prova(value))[0]
        eel.fill_value('tensao-prova', prova)
        return
        
    eel.populate_select(tag, results)


@eel.expose
def comprimento_parafuso(dicti):
    calc = Calculate()
    bd=SGBD()
    a_d = calc.calc_a_d(dicti)
    eel.fill_value('a_d', a_d)
    a_t = bd.filter_a_t(dicti['pitch'])
    a_t = float(a_t[0])
    eel.fill_value('a_t', a_t)
    comprimento = calc.calc_comprimento(dicti)
    divisivel = calc.encontre_proximo_divisivel_por_cinco(comprimento)
    eel.fill_value('comprimentoParafuso', comprimento)
    eel.fill_value('comprimentoPadronizado', divisivel)
    

@eel.expose
def rigidez_parafuso(dicti):
    calc = Calculate()
    l_t_cap, l_d, l_t, kp = calc.rigidez_parafuso(dicti)
    eel.fill_value('l_t_cap', l_t_cap)
    eel.fill_value('l_d', l_d)
    eel.fill_value('l_t', l_t)
    eel.fill_value('kp',kp)


@eel.expose
def fill_table(n):
    bd = SGBD()
    mats = bd.alcomprimentoParafuso_materials()
    eel.populate_select(f'Material-{n}', mats)
    elasticity = (bd.filter_elasticy('Aço'))[0]
    eel.fill_value(f'ModuleE-{n}', elasticity)


@eel.expose
def filter_elasticity(n, value):
    bd = SGBD()
    elasticity = (bd.filter_elasticy(value))[0]
    eel.fill_value(f'ModuleE-{n}', elasticity)


@eel.expose
def rigidez_materials(values):
    calc = Calculate()
    kp = float(values['kp'])
    table_final, final_va = calc.rigidez_materiais(values)
    eel.table_cone_deformacao(table_final)
    eel.fill_value('km', final_va)
    eel.fill_value('c_p', round((kp/(kp + final_va)),4))


@eel.expose
def filter_classe_metrica():
    bd = SGBD()
    classes = bd.filter_classe_metrica()
    eel.populate_select('ClasseMetrica', classes)


@eel.expose
def validar_criterios(values):
    metrica = SGBD().filter_resistencia(values['classe'])
    obj = values['objetivo']
    obj_criterio = CriteriosProjeto(
                c=values['c_p'],
                esc= values['escoamento'],
                rup= values['ruptura'],
                area= values['area'],
                tensao_pre_carga = values['tensao_pre_carga'],
                precarga = values['pre_carga'],
                classe_metrica=metrica
            )
        
    typeof = 'fmax' if ("max-local" in obj) else 'cs'
    
    if ('checar-cs' in obj):
        obj_criterio.max = float(values['forcaMax'])        
        if (obj == "checar-cs"):
            
            obj_criterio.min = float(values['forcaMin'])
            table = obj_criterio.get_table(typeof)
            eel.table_criterios_projeto(table, typeof)
    
    if ('max-local' in obj):
        obj_criterio.cs_junta= float(values['csJunta'])
        
        if (obj == "max-local-flutuante"):
            obj_criterio.cs_fadiga= float(values['csFadiga'])
            obj_criterio.min = float(values['forcaMin'])
            table = obj_criterio.get_table(typeof)
            eel.table_criterios_projeto(table, typeof)   
    
    compressao = obj_criterio.compressao_membros(typeof)
    first_ciclo = obj_criterio.falha_primeiro_ciclo(typeof)
    
    eel.fill_value('criterio-um', compressao)
    eel.fill_value('criterio-dois', first_ciclo)
    
    texto = 'A máxima força' if (typeof == 'fmax') else 'O CS'
    eel.fill_value("resultado_criterio", f'{texto} é {min(compressao,first_ciclo)}')




eel.start('interface.html', mode='chrome-app', port=8080, cmdline_args=['--start-fullscreen', '--browser-startup-dialog'])
