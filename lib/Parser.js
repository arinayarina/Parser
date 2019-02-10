const Context = require('./Сontext');
const Patterns = require('./patterns');

let patterns = new Patterns();

class Parser {
    constructor(){

    }

    parse(text) {

        let context = new Context(text);
        context.init(text);

        while (context.atEnd()) {
            if (context.isSpace()) { // если текущий символ -- пробел
                // считать, посчитать
                // если не в начале строки сгенерировать узел пробела
            }
            let charPatterns = patterns.get(context); // доступные шаблоны, определяемые режимом и текущим символом
            if (charPatterns.some(pattern => {
                return parsePattern(context, pattern);
                // если успех, контекст изменяется соответствующим образом:
                // сдвигается position
                // наращивается дерево
                // изменяется узел, если нужно и т.п.
                // если не успех, контекст должен быть восстановлен до исходного состояния
            })) continue;
            createErrorNode(context);
        }
    }


    parsePattern(context, pattern) {
        context.backup();
        if (pattern.regexp.match(...)) {
            // сгенерировать соответствующий узел
            context.moveTo(...); // переместить позицию контекста, пересчитать режимы
            // выйти из текущего узла, если текущий узел не поддерживает формат нового узла
            // если нужно, сгенерировать узел-контейнер (код, список, цитата и т.п.)
            // добавить узел в дерево
            return true;
        } else {
            context.restore();
            return false;
        }
    }


    show(){
        return context;
    }

}

module.exports = Parser;