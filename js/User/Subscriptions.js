btnIndividual = document.querySelector('.individual-nav');
btnEnterprise = document.querySelector('.enterprise-nav');
btnEducation = document.querySelector('.education-nav');
btnsChangeIndividual = document.querySelectorAll('.change-link.individual');
btnsChangeEnterprise = document.querySelectorAll('.change-link.enterprise');
btnsChangeEducation = document.querySelectorAll('.change-link.education');
priceAmountFree = document.querySelector('.price-amount_free');
priceAmountPro = document.querySelector('.price-amount_pro');
priceAmountMega = document.querySelector('.price-amount_mega');
tittleFree = document.querySelector('.subscription-title_free');
individualStats = document.querySelectorAll('.individual');
enterpriseStats = document.querySelectorAll('.enterprise');
educationStats = document.querySelectorAll('.education');
individalPricesAmount = ['0', '200', '150'];
enterprisePricesAmount = ['1500', '2500', '2000'];
educationPricesAmount = ['100', '180', '130'];

function changePlan(plan){
    btnIndividual.classList.remove('active');
    btnEnterprise.classList.remove('active');
    btnEducation.classList.remove('active');
    if(plan === 'individual'){
        btnIndividual.classList.add('active');
        btnsChangeIndividual.forEach(btn => btn.classList.remove('hidden'));
        btnsChangeEnterprise.forEach(btn => btn.classList.add('hidden'));
        btnsChangeEducation.forEach(btn => btn.classList.add('hidden'));
        priceAmountMega.textContent = individalPricesAmount[1];
        priceAmountPro.textContent = individalPricesAmount[2];
        priceAmountFree.textContent = individalPricesAmount[0];
        tittleFree.textContent = 'Gratis';
        individualStats.forEach(stat => stat.classList.remove('hidden'));
        enterpriseStats.forEach(stat => stat.classList.add('hidden'));
        educationStats.forEach(stat => stat.classList.add('hidden'));
    }else if(plan === 'enterprise'){
        btnEnterprise.classList.add('active');
        btnsChangeIndividual.forEach(btn => btn.classList.add('hidden'));
        btnsChangeEnterprise.forEach(btn => btn.classList.remove('hidden'));
        btnsChangeEducation.forEach(btn => btn.classList.add('hidden'));
        priceAmountMega.textContent = enterprisePricesAmount[1];
        priceAmountPro.textContent = enterprisePricesAmount[2];
        priceAmountFree.textContent = enterprisePricesAmount[0];
        tittleFree.textContent = 'Basica';
        enterpriseStats.forEach(stat => stat.classList.remove('hidden'));
        individualStats.forEach(stat => stat.classList.add('hidden'));
        educationStats.forEach(stat => stat.classList.add('hidden'));
    }else if(plan === 'education'){
        btnEducation.classList.add('active');
        btnsChangeIndividual.forEach(btn => btn.classList.add('hidden'));
        btnsChangeEnterprise.forEach(btn => btn.classList.add('hidden'));
        btnsChangeEducation.forEach(btn => btn.classList.remove('hidden'));
        priceAmountMega.textContent = educationPricesAmount[1];
        priceAmountPro.textContent = educationPricesAmount[2];
        priceAmountFree.textContent = educationPricesAmount[0];
        tittleFree.textContent = 'Basica';
        educationStats.forEach(stat => stat.classList.remove('hidden'));
        individualStats.forEach(stat => stat.classList.add('hidden'));
        enterpriseStats.forEach(stat => stat.classList.add('hidden'));
    }
}