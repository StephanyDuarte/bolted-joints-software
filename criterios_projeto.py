import sympy as sp

class CriteriosProjeto:
    def __init__(self, c, esc, rup,  area, tensao_pre_carga, precarga, classe_metrica) -> None:
        self.C = float(c)
        self.area = float(area)
        self.ruptura = float(rup)
        self.escoamento = float(esc)
        self.pre_carga = float(precarga)
        self.tensao_pre_carga = float(tensao_pre_carga)
        self.resistencia = classe_metrica
        self.min = None
        self.max = None
        self.cs_fadiga = None
        self.cs_junta = None


    def get_table(self, typeof):
        return [
            [self.build_table('Soodeberg', typeof)],
            [self.build_table('Goodman Modificado', typeof)],
            [self.build_table('Gerber', typeof)],
            [self.build_table('ASME-Eliptico', typeof)],
        ]
    
    
    def build_table(self, criterio, typeof):
        if (criterio == 'Gerber'):
            func = self.gerber
        elif (criterio == 'Goodman Modificado'):
            func = self.goodman
        elif (criterio == 'Soodeberg'):
            func = self.soderberg
        elif (criterio == 'ASME-Eliptico'):
            func = self.asme
            
        get_info = self.get_fmax if (typeof=='fmax')  else self.get_cs
            
        alternada = float(func())
        media = round(alternada + self.tensao_pre_carga,2)
        value = round(get_info(alternada),2)
        alternada = round(alternada,2)
        
        return [criterio, value, media, alternada]

        
    def get_fmax(self, total):
        fmax = ((total * 2 * self.area)/ (self.C * self.cs_fadiga)) - (self.min*1000)
        return fmax


    def get_cs(self, total):
        cs = ((total * 2 * self.area)/ (self.C * ((self.max*1000) + (self.min*1000))))
        return cs



    def gerber(self):
        x = sp.Symbol('x')
        expr = (x/self.resistencia) + ((self.tensao_pre_carga + x)/self.ruptura)**2 - 1
        alternada = sp.Poly(expr)
        roots = sp.solve(alternada, x)
        alternada = [root for root in roots if (root>0)]
        return alternada[0]


    def goodman(self):
        x = sp.Symbol('x')
        expr = (x/self.resistencia) + ((self.tensao_pre_carga + x)/self.ruptura) - 1
        alternada = sp.Poly(expr)
        roots = sp.solve(alternada, x)
        alternada = [root for root in roots if (root>0)]
        return alternada[0]


    def asme(self):
        x = sp.Symbol('x')
        expr = (x/self.resistencia)**2 + ((self.tensao_pre_carga + x)/self.ruptura)**2 - 1
        alternada = sp.Poly(expr)
        roots = sp.solve(alternada, x)
        alternada = [root for root in roots if (root>0)]
        return alternada[0]


    def soderberg(self):
        x = sp.Symbol('x')
        expr = (x/self.resistencia) + ((self.tensao_pre_carga + x)/self.escoamento) - 1
        alternada = sp.Poly(expr)
        roots = sp.solve(alternada, x)
        alternada = [root for root in roots if (root>0)]
        return alternada[0]


    def compressao_membros(self, typeof):
        if (typeof=='fmax'):
            value = self.pre_carga/((1-self.C)*self.cs_junta) #fmax
        else:
            value = self.pre_carga/((1-self.C)* (self.max*1000)) #n da junta
        return round(value,2)

    def falha_primeiro_ciclo(self, typeof):
        if (typeof=='fmax'):
            value = ((self.escoamento * self.area) - self.pre_carga)/(self.C *self.cs_junta) #fmax
        else:
            value = ((self.escoamento * self.area) - self.pre_carga)/(self.C *(self.max*1000)) #n da junta
        return round(value,2)