import math
import methods as met
class Calculate:
    def __init__(self) -> None:
        pass
    
    @staticmethod
    def calc_comprimento(dict):
        w = dict['alturaArruela']
        washer = float(w) if w else 0
            
        arg_1 = float(dict['alturaTotalChapas'])
        arg_2 = 2 * float(dict['pitch'])
        arg_3 = float(dict['alturaPorca']) * float(dict['quantidadePorca'])
        arg_4 =  washer * float(dict['quantidadeArruela'])
        
        return round(arg_1 + arg_2 + arg_3 + arg_4, 3)
     
    @staticmethod
    def encontre_proximo_divisivel_por_cinco(numero):
        divisivel = numero // 5 * 5
        return divisivel + 5
    
    @staticmethod
    def calc_a_d(dict):
        d = int(dict['screw'])
        area = 0.25 * (d **2) * math.pi
        return round(area, 3)


    @staticmethod
    def rigidez_parafuso(dict):
        total_l = float(dict['comprimentoParafuso'])
        total_sheets = float(dict['alturaTotalChapas'])
        d = int(dict['screw'])
        E = int(dict['elasticity'])
        a_d = float(dict['a_d'])
        a_t = float(dict['a_t'])
         
        if total_l<= 125:
            spare = 6
        elif total_l<= 200:
            spare = 12
        else:
            spare = 25
        l_t_cap  = round((2 * d) + spare,3)
        l_d  = round(float(total_l - l_t_cap),3)
        l_t = round(float(total_sheets - l_d),3)
        kp = round(((a_d * a_t * E)/ ((a_d *l_t) + (a_t * l_d))/1000),3)
        
        return l_t_cap, l_d, l_t, kp
        

    
    def rigidez_materiais(self, lst):
        kms = []
        average = round(float(lst['alturaTotalChapas'])/2,2)
        total = round(float(lst['alturaTotalChapas']),2)
        dim = int(lst['screw'])
        incremental = 0
        last_value = 0
        
        for n, deep, E in lst['table']:
            E = float(E)
            incremental += float(deep)
            if (incremental <= average) and (last_value==0): 
                kms.append([n, E, self.dw_1(dim), (incremental-last_value)])
            elif (incremental <= average) and (incremental): 
                kms.append([n, E, self.dw(dim,last_value), (incremental-last_value)])
            elif (last_value >= average) and (incremental == total):
                kms.append([n, E, self.dw_1(dim), (incremental-last_value)])
            elif (incremental >= average) and (last_value>=average):
                kms.append([n, E, self.dw(dim,last_value), (incremental-last_value)])
            elif (incremental>= average) and (last_value<average):
                dw_before = self.dw(dim, last_value)
                kms.append([n, E, dw_before, round(average - last_value, 2)])
                if (incremental == total):
                    kms.append([n, E, self.dw_1(dim), (incremental-average)])
                else:
                    after = round(incremental-average,2) # aqui deve ser realizada a inversao
                    kms.append([n, E, self.dw(dim, after), after])
                
                "1,5 *d + 2xtan(30)*altura até o momento(last_value)"
            last_value = incremental 
        
        return self.calc_k(dim, kms)
            

    
    def calc_k(self, dim, lst_kms):
        pi = met.pi()
        tan30 = met.tan(30)
        result = {}
        table_final = lst_kms
        for i, (n, e, dw, t) in enumerate(lst_kms):
            sup = pi * tan30 * dim * e
            div_1 = (2*tan30 *t + dw - dim)/ (2*tan30 *t + dw + dim)
            div_2 = (dw + dim)/ (dw - dim)
            div = div_1 * div_2
            baixo = met.log(div)
            res = (sup/baixo)
            
            if result.get(n):
                result[n].append(res)
            else:
                result[n] = [res]
            table_final[i].extend([round((res/1000),3)])
            table_final[i][2] = round(table_final[i][2],3)
        return table_final, self.final_analysis(result)


    @staticmethod
    def dw( dim, last_value):
        return 1.5 * dim + (2* met.tan(30)* last_value)

    @staticmethod
    def dw_1(dim):
        return 1.5 *dim
    
    @staticmethod
    def final_analysis(dicti):
        new_res = []
        res = 0
        for k, v in dicti.items():
            if len(v)>1:
                sum_v = [(1/x) for x in v]
                res += sum(sum_v)
            else:
                res += 1/v[0]
        final = round((1/res)/1000,3)
        return final
                
        