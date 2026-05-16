/**
 * Скрипт для проверки полноты переводов
 * Использование: node check-translations.js
 */

const fs = require('fs');
const path = require('path');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

console.log(`${colors.bold}${colors.cyan}=== Проверка полноты переводов ===${colors.reset}\n`);

// Проверка переводов курсов
console.log(`${colors.bold}1. Проверка переводов курсов${colors.reset}`);

try {
  const localesPath = path.join(__dirname, 'backend', 'app', 'core', 'locales.py');
  const localesContent = fs.readFileSync(localesPath, 'utf-8');
  
  // Извлекаем ID курсов из COURSE_TRANSLATIONS
  const courseMatches = localesContent.match(/COURSE_TRANSLATIONS\s*=\s*{[\s\S]*?"kz":\s*{([\s\S]*?)}\s*}/);
  if (courseMatches) {
    const kzSection = courseMatches[1];
    const courseIds = [...kzSection.matchAll(/(\d+):\s*{/g)].map(m => parseInt(m[1]));
    
    console.log(`   ${colors.green}✓${colors.reset} Найдено переводов курсов: ${courseIds.length}`);
    console.log(`   Курсы с переводами: ${courseIds.join(', ')}`);
    
    // Проверяем, что все курсы от 1 до 18 переведены
    const missingCourses = [];
    for (let i = 1; i <= 18; i++) {
      if (!courseIds.includes(i)) {
        missingCourses.push(i);
      }
    }
    
    if (missingCourses.length > 0) {
      console.log(`   ${colors.yellow}⚠${colors.reset} Отсутствуют переводы для курсов: ${missingCourses.join(', ')}`);
    } else {
      console.log(`   ${colors.green}✓${colors.reset} Все курсы (1-18) имеют переводы`);
    }
  }
} catch (error) {
  console.log(`   ${colors.red}✗${colors.reset} Ошибка при проверке переводов курсов: ${error.message}`);
}

console.log();

// Проверка переводов миссий
console.log(`${colors.bold}2. Проверка переводов миссий${colors.reset}`);

try {
  const localesPath = path.join(__dirname, 'backend', 'app', 'core', 'locales.py');
  const localesContent = fs.readFileSync(localesPath, 'utf-8');
  
  // Извлекаем ID миссий из MISSION_TRANSLATIONS
  const missionMatches = localesContent.match(/MISSION_TRANSLATIONS\s*=\s*{[\s\S]*?"kz":\s*{([\s\S]*?)}\s*}/);
  if (missionMatches) {
    const kzSection = missionMatches[1];
    const missionIds = [...kzSection.matchAll(/"([^"]+)":\s*{/g)].map(m => m[1]);
    
    console.log(`   ${colors.green}✓${colors.reset} Найдено переводов миссий: ${missionIds.length}`);
    console.log(`   Миссии с переводами: ${missionIds.join(', ')}`);
  }
} catch (error) {
  console.log(`   ${colors.red}✗${colors.reset} Ошибка при проверке переводов миссий: ${error.message}`);
}

console.log();

// Проверка UI переводов
console.log(`${colors.bold}3. Проверка UI переводов${colors.reset}`);

try {
  const constantsPath = path.join(__dirname, 'constants.tsx');
  const constantsContent = fs.readFileSync(constantsPath, 'utf-8');
  
  // Извлекаем ключи из KZ_TEXT_OVERRIDES
  const kzOverridesMatch = constantsContent.match(/const KZ_TEXT_OVERRIDES\s*=\s*{([\s\S]*?)};/);
  if (kzOverridesMatch) {
    const overridesContent = kzOverridesMatch[1];
    
    // Подсчитываем количество секций
    const sections = [...overridesContent.matchAll(/(\w+):\s*{/g)].map(m => m[1]);
    
    console.log(`   ${colors.green}✓${colors.reset} Найдено секций UI переводов: ${sections.length}`);
    console.log(`   Секции: ${sections.join(', ')}`);
    
    // Подсчитываем общее количество переведенных строк
    const translatedStrings = [...overridesContent.matchAll(/\w+:\s*['"`]/g)].length;
    console.log(`   ${colors.green}✓${colors.reset} Всего переведенных строк: ${translatedStrings}`);
  }
} catch (error) {
  console.log(`   ${colors.red}✗${colors.reset} Ошибка при проверке UI переводов: ${error.message}`);
}

console.log();

// Проверка шрифтов
console.log(`${colors.bold}4. Проверка конфигурации шрифтов${colors.reset}`);

try {
  const indexPath = path.join(__dirname, 'index.html');
  const indexContent = fs.readFileSync(indexPath, 'utf-8');
  
  // Проверяем наличие Noto Sans
  if (indexContent.includes('Noto+Sans')) {
    console.log(`   ${colors.green}✓${colors.reset} Шрифт Noto Sans подключен`);
  } else {
    console.log(`   ${colors.red}✗${colors.reset} Шрифт Noto Sans не найден`);
  }
  
  // Проверяем наличие cyrillic-ext
  if (indexContent.includes('cyrillic-ext') || indexContent.includes('cyrillic,cyrillic-ext')) {
    console.log(`   ${colors.green}✓${colors.reset} Поддержка Cyrillic Extended включена`);
  } else {
    console.log(`   ${colors.yellow}⚠${colors.reset} Поддержка Cyrillic Extended не найдена`);
  }
  
  // Проверяем конфигурацию Tailwind
  if (indexContent.includes("display: ['Noto Sans'")) {
    console.log(`   ${colors.green}✓${colors.reset} Tailwind настроен на Noto Sans для display`);
  } else {
    console.log(`   ${colors.yellow}⚠${colors.reset} Tailwind может использовать другой шрифт для display`);
  }
} catch (error) {
  console.log(`   ${colors.red}✗${colors.reset} Ошибка при проверке шрифтов: ${error.message}`);
}

console.log();

// Проверка CSS
console.log(`${colors.bold}5. Проверка CSS стилей${colors.reset}`);

try {
  const stylesPath = path.join(__dirname, 'styles.css');
  const stylesContent = fs.readFileSync(stylesPath, 'utf-8');
  
  // Проверяем правила переноса слов
  if (stylesContent.includes('word-wrap: break-word')) {
    console.log(`   ${colors.green}✓${colors.reset} Правило word-wrap добавлено`);
  } else {
    console.log(`   ${colors.yellow}⚠${colors.reset} Правило word-wrap не найдено`);
  }
  
  if (stylesContent.includes('overflow-wrap: break-word')) {
    console.log(`   ${colors.green}✓${colors.reset} Правило overflow-wrap добавлено`);
  } else {
    console.log(`   ${colors.yellow}⚠${colors.reset} Правило overflow-wrap не найдено`);
  }
  
  if (stylesContent.includes('hyphens: auto')) {
    console.log(`   ${colors.green}✓${colors.reset} Правило hyphens добавлено`);
  } else {
    console.log(`   ${colors.yellow}⚠${colors.reset} Правило hyphens не найдено`);
  }
  
  // Проверяем класс .font-display
  if (stylesContent.includes('.font-display')) {
    console.log(`   ${colors.green}✓${colors.reset} Класс .font-display определен`);
  } else {
    console.log(`   ${colors.yellow}⚠${colors.reset} Класс .font-display не найден`);
  }
} catch (error) {
  console.log(`   ${colors.red}✗${colors.reset} Ошибка при проверке CSS: ${error.message}`);
}

console.log();
console.log(`${colors.bold}${colors.cyan}=== Проверка завершена ===${colors.reset}\n`);

// Итоговая статистика
console.log(`${colors.bold}Рекомендации:${colors.reset}`);
console.log(`1. Убедитесь, что все курсы имеют переводы на казахский`);
console.log(`2. Проверьте отображение казахских символов в браузере`);
console.log(`3. Протестируйте перенос длинных слов на мобильных устройствах`);
console.log(`4. Проверьте работу переключения языка в настройках`);
console.log();
