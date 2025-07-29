#@MercadoLibreSearch @Smoke
#Feature: MercadoLibre search
 #   Scenario: User search and validate results
  #      Given User navigates to MercadoLibre page
   #     When User search for cars options
    #    Then It should show all the results according to the search

@Smoke
Feature: Navegación pagina de k0lmena   
    Scenario: verificar que se pueda navegar en la pagina de k0lmena
        Given El usuario esta en la pagina de k0lmema   
        When El usuario clickea el link de change log
        And El usuario clickea la version 2.0
        Then El usuario ve la informacion de la version 2.0
        
